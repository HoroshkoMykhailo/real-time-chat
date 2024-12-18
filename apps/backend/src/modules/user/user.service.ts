import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { UserRole } from './libs/enums/enums.js';
import { type User as TUser, type UserService } from './libs/types/types.js';
import { type UserDocument } from './user.model.js';
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
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.CONFLICT
      });
    }

    const { hashedData: hashedPassword } =
      await this.#encryption.hash(password);

    const user = {
      ...payload,
      password: hashedPassword,
      role: UserRole.USER
    };

    return await this.#userRepository.create(user);
  }

  public async getByEmail(email: string): Promise<UserDocument> {
    const item = await this.#userRepository.getByEmail(email);

    if (!item) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.NOT_FOUND
      });
    }

    return item;
  }

  public mapUser(document: UserDocument): TUser {
    return {
      createdAt: document.createdAt.toDateString(),
      email: document.email,
      id: document.id as string,
      role: document.role,
      updatedAt: document.updatedAt.toDateString()
    };
  }
}

export { User };
