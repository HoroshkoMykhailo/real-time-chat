import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { UserRole } from './libs/enums/enums.js';
import { type User as TUser, type UserService } from './libs/types/types.js';
import { type UserDocument } from './user.model.js';
import { type User as UserRepository } from './user.repository.js';

type Constructor = {
  encryption: Encryption;
  profileRepository: ProfileRepository;
  userRepository: UserRepository;
};

class User implements UserService {
  #encryption: Encryption;
  #profileRepository: ProfileRepository;
  #userRepository: UserRepository;

  public constructor({
    encryption,
    profileRepository,
    userRepository
  }: Constructor) {
    this.#userRepository = userRepository;
    this.#profileRepository = profileRepository;
    this.#encryption = encryption;
  }

  public async create(payload: UserSignUpRequestDto): Promise<TUser> {
    const { email, password, username } = payload;

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

    const createdUser = await this.#userRepository.create(user);

    const profile = {
      userId: createdUser.id,
      username
    };

    await this.#profileRepository.create(profile);

    return createdUser;
  }

  public async find(id: string): Promise<TUser> {
    const user = await this.#userRepository.getById(id);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return user;
  }

  public async getByEmail(email: string): Promise<UserDocument> {
    const user = await this.#userRepository.getByEmail(email);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.NOT_FOUND
      });
    }

    return user;
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
