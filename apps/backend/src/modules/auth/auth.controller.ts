import { type APIPath } from '~/libs/enums/enums.js';
import {
  Controller,
  type ControllerAPIHandler,
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { HTTPCode, HTTPMethod } from '~/libs/modules/http/http.js';
import { type LoggerModule } from '~/libs/modules/logger/logger.js';
import { type ValueOf } from '~/libs/types/types.js';

import { AuthApiPath } from './libs/enums/enums.js';
import {
  type AuthController,
  type AuthService,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';
import {
  signInValidationSchema,
  signUpValidationSchema
} from './libs/validation-schemas/validation-schemas.js';

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  authService: AuthService;
  logger: LoggerModule;
};

class Auth extends Controller implements AuthController {
  #authService: AuthService;

  public constructor({ apiPath, authService, logger }: Constructor) {
    super({ apiPath, logger });
    this.#authService = authService;

    this.addRoute({
      handler: this.register as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: signUpValidationSchema
      },
      url: AuthApiPath.SIGN_UP
    });

    this.addRoute({
      handler: this.signIn as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: signInValidationSchema
      },
      url: AuthApiPath.SIGN_IN
    });

    this.addRoute({
      handler: this.googleOAuthInit,
      method: HTTPMethod.GET,
      url: AuthApiPath.GOOGLE
    });

    this.addRoute({
      handler: this.googleOAuthCallback as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AuthApiPath.GOOGLE_CALLBACK
    });
  }

  public googleOAuthCallback = async (
    options: ControllerAPIHandlerOptions<{
      query: {
        code?: string;
        error?: string;
        error_description?: string;
        state?: string;
      };
    }>
  ): Promise<ControllerAPIHandlerResponse<undefined>> => {
    const redirectTo = await this.#authService.handleGoogleOAuthCallback(
      options.query
    );

    return { redirectTo, status: HTTPCode.FOUND };
  };

  public googleOAuthInit = async (): Promise<
    ControllerAPIHandlerResponse<undefined>
  > => {
    if (!this.#authService.isGoogleOAuthConfigured()) {
      return {
        redirectTo: this.#authService.getGoogleMisconfigurationRedirect(),
        status: HTTPCode.FOUND
      };
    }

    const state = await this.#authService.createGoogleOAuthState();

    return {
      redirectTo: this.#authService.buildGoogleAuthorizationUrl(state),
      status: HTTPCode.FOUND
    };
  };

  public register = async (
    options: ControllerAPIHandlerOptions<{
      body: UserSignUpRequestDto;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserSignUpResponseDto>> => {
    return {
      payload: await this.#authService.register(options.body),
      status: HTTPCode.CREATED
    };
  };

  public signIn = async (
    options: ControllerAPIHandlerOptions<{
      body: UserSignInRequestDto;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserSignInResponseDto>> => {
    return {
      payload: await this.#authService.signIn(options.body),
      status: HTTPCode.OK
    };
  };
}

export { Auth };
