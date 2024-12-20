import {
  type User,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './types.js';

type AuthApi = {
  getUser(): Promise<User>;
  signIn(payload: UserSignInRequestDto): Promise<UserSignInResponseDto>;
  signUp(payload: UserSignUpRequestDto): Promise<UserSignUpResponseDto>;
};

export { type AuthApi };
