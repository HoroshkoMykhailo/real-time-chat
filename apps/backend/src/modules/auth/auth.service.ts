import { jwtVerify, SignJWT } from 'jose';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type Token } from '~/libs/modules/token/token.js';

import { type UserService } from '../user/user.js';
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile
} from './libs/helpers/google-oauth.helper.js';
import {
  type AuthService,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';

const GOOGLE_OAUTH_STATE_PURPOSE = 'google-oauth-state';

type Constructor = {
  config: ConfigModule;
  encryptionService: Encryption;
  tokenService: Token;
  userService: UserService;
};

type GoogleOAuthUserResult = Awaited<
  ReturnType<UserService['findOrCreateFromGoogleOAuth']>
>;

class Auth implements AuthService {
  #config: ConfigModule;
  #encryptionService: Encryption;
  #tokenService: Token;
  #userService: UserService;

  public constructor({
    config,
    encryptionService,
    tokenService,
    userService
  }: Constructor) {
    this.#config = config;
    this.#userService = userService;
    this.#tokenService = tokenService;
    this.#encryptionService = encryptionService;
  }

  public buildGoogleAuthorizationUrl = (state: string): string => {
    const { CLIENT_ID, REDIRECT_URI } = this.#config.ENV.GOOGLE_OAUTH;
    const parameters = new URLSearchParams({
      access_type: 'online',
      client_id: CLIENT_ID,
      prompt: 'select_account',
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${parameters.toString()}`;
  };

  public createGoogleOAuthState = async (): Promise<string> => {
    const secret = new TextEncoder().encode(this.#config.ENV.JWT.SECRET);

    return await new SignJWT({ purpose: GOOGLE_OAUTH_STATE_PURPOSE })
      .setProtectedHeader({ alg: this.#config.ENV.JWT.ALGORITHM })
      .setExpirationTime('10m')
      .setIssuedAt()
      .sign(secret);
  };

  public getGoogleMisconfigurationRedirect = (): string => {
    return this.#buildOAuthFailureRedirect('misconfigured');
  };

  public handleGoogleOAuthCallback = async (query: {
    code?: string;
    error?: string;
    error_description?: string;
    state?: string;
  }): Promise<string> => {
    if (query.error) {
      return this.#buildOAuthFailureRedirect(
        query.error_description ?? query.error
      );
    }

    const { code } = query;
    const { state } = query;

    if (!code || !state) {
      return this.#buildOAuthFailureRedirect('missing_code');
    }

    try {
      await this.#verifyGoogleOAuthState(state);
    } catch {
      return this.#buildOAuthFailureRedirect('invalid_state');
    }

    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } =
      this.#config.ENV.GOOGLE_OAUTH;

    let accessToken: string;

    try {
      ({ accessToken } = await exchangeGoogleAuthorizationCode({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        code,
        redirectUri: REDIRECT_URI
      }));
    } catch {
      return this.#buildOAuthFailureRedirect('token_exchange');
    }

    let profile: Awaited<ReturnType<typeof fetchGoogleUserProfile>>;

    try {
      profile = await fetchGoogleUserProfile(accessToken);
    } catch {
      return this.#buildOAuthFailureRedirect('userinfo');
    }

    if (!profile.email_verified) {
      return this.#buildOAuthFailureRedirect('email_not_verified');
    }

    let oauthResult: GoogleOAuthUserResult;

    try {
      const [emailLocalPart = ''] = profile.email.split('@');
      let resolvedDisplayName = 'User';

      if (typeof profile.name === 'string' && profile.name.trim() !== '') {
        resolvedDisplayName = profile.name;
      } else if (emailLocalPart !== '') {
        resolvedDisplayName = emailLocalPart;
      }

      oauthResult = await this.#userService.findOrCreateFromGoogleOAuth({
        email: profile.email,
        googleSub: profile.sub,
        name: resolvedDisplayName
      });
    } catch (error) {
      if (error instanceof HTTPError) {
        return this.#buildOAuthFailureRedirect(error.message);
      }

      return this.#buildOAuthFailureRedirect('server');
    }

    const { isNewGoogleRegistration, user } = oauthResult;

    const token = await this.#tokenService.createToken({
      userId: user.id
    });

    const base = this.#getFrontendBase();
    const hashParameters = new URLSearchParams({
      token
    });

    if (isNewGoogleRegistration) {
      hashParameters.set('oauthNewUser', '1');
    }

    return `${base}/auth/google/callback#${hashParameters.toString()}`;
  };

  public isGoogleOAuthConfigured = (): boolean => {
    const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL, REDIRECT_URI } =
      this.#config.ENV.GOOGLE_OAUTH;

    return [CLIENT_ID, CLIENT_SECRET, FRONTEND_URL, REDIRECT_URI].every(
      value => value.trim() !== ''
    );
  };

  public register = async (
    userRequestDto: UserSignUpRequestDto
  ): Promise<UserSignUpResponseDto> => {
    const user = await this.#userService.create(userRequestDto);
    const token = await this.#tokenService.createToken({ userId: user.id });

    return { token, user };
  };

  public signIn = async (
    userRequestDto: UserSignInRequestDto
  ): Promise<UserSignInResponseDto> => {
    const user = await this.#userService.getByEmail(userRequestDto.email);

    const { password } = user;

    const isPasswordValid = await this.#encryptionService.compare(
      userRequestDto.password,
      password
    );

    if (!isPasswordValid) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.UNAUTHORIZED
      });
    }

    const token = await this.#tokenService.createToken({
      userId: user._id.toString()
    });

    const mappedUser = this.#userService.mapUser(user);

    return { token, user: mappedUser };
  };

  #buildOAuthFailureRedirect = (message: string): string => {
    const base = this.#getFrontendBase();

    return `${base}/sign-in?oauthError=${encodeURIComponent(message)}`;
  };

  #getFrontendBase = (): string => {
    const raw = this.#config.ENV.GOOGLE_OAUTH.FRONTEND_URL.trim();

    if (raw === '') {
      return 'http://localhost:3000';
    }

    return raw.replace(/\/$/u, '');
  };

  #verifyGoogleOAuthState = async (state: string): Promise<void> => {
    const secret = new TextEncoder().encode(this.#config.ENV.JWT.SECRET);
    const { payload } = await jwtVerify(state, secret);

    if (payload['purpose'] !== GOOGLE_OAUTH_STATE_PURPOSE) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_TOKEN,
        status: HTTPCode.UNAUTHORIZED
      });
    }
  };
}

export { Auth };
