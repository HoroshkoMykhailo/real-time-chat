import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import { HTTPCode } from '~/libs/modules/http/http.js';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { UserError } from './libs/exceptions/exceptions.js';
import { type User as TUser, type UserService } from './libs/types/types.js';
import { type User as UserRepository } from './user.repository.js';

type Constructor = {
  encryption: Encryption;
  userRepository: UserRepository;
};

class User implements UserService {
  #encryption: Encryption;
  #userRepository: UserRepository;

  public constructor({ encryption, userRepository }: Constructor) {
    this.#userRepository = userRepository;
    this.#encryption = encryption;
  }

  public async create(payload: UserSignUpRequestDto): Promise<TUser> {
    const { email, password } = payload;

    const existingUser = await this.#userRepository.getByEmail(email);

    if (existingUser) {
      throw new UserError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.CONFLICT
      });
    }

    const { hashedData: hashedPassword } =
      await this.#encryption.hash(password);

    const user = {
      ...payload,
      password: hashedPassword
    };

    return await this.#userRepository.create(user);
  }
}

export { User };
