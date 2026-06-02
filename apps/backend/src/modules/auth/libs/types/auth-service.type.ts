import {
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthService = {
  buildGoogleAuthorizationUrl(_state: string): string;
  createGoogleOAuthState(): Promise<string>;
  getGoogleMisconfigurationRedirect(): string;
  handleGoogleOAuthCallback(_query: {
    code?: string;
    error?: string;
    error_description?: string;
    state?: string;
  }): Promise<string>;
  isGoogleOAuthConfigured(): boolean;
  register(_user: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
  signIn(_user: UserSignInRequestDto): Promise<UserSignInResponseDto>;
};

export { type AuthService };
