import { type Token } from '~/libs/modules/token/token.js';

import { type UserService } from '../user/user.js';
import {
  type AuthService,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';

type Constructor = {
  tokenService: Token;
  userService: UserService;
};

class Auth implements AuthService {
  #tokenService: Token;
  #userService: UserService;

  public register = async (
    userRequestDto: UserSignUpRequestDto
  ): Promise<UserSignUpResponseDto> => {
    const user = await this.#userService.create(userRequestDto);
    const token = await this.#tokenService.createToken({ userId: user.id });

    return { token, user };
  };

  public constructor({ tokenService, userService }: Constructor) {
    this.#userService = userService;
    this.#tokenService = tokenService;
  }
}

export { Auth };
