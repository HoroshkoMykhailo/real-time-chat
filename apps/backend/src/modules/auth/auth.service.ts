import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { type Token } from '~/libs/modules/token/token.js';

import { type UserService } from '../user/user.js';
import {
  type AuthService,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';

type Constructor = {
  encryptionService: Encryption;
  tokenService: Token;
  userService: UserService;
};

class Auth implements AuthService {
  #encryptionService: Encryption;
  #tokenService: Token;
  #userService: UserService;

  public constructor({
    encryptionService,
    tokenService,
    userService
  }: Constructor) {
    this.#userService = userService;
    this.#tokenService = tokenService;
    this.#encryptionService = encryptionService;
  }

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
}

export { Auth };
