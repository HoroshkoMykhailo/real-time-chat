import {
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthService = {
  register(_user: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
  signIn(_user: UserSignInRequestDto): Promise<UserSignInResponseDto>;
};

export { type AuthService };
