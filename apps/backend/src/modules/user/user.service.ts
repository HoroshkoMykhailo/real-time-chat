import bcrypt from 'bcrypt';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { type User as TUser, type UserService } from './libs/types/types.js';
import { type User as UserRepository } from './user.repository.js';

type Constructor = Record<'userRepository', UserRepository>;

const SALT_ROUNDS = 10;

class User implements UserService {
  #userRepository: UserRepository;

  public constructor({ userRepository }: Constructor) {
    this.#userRepository = userRepository;
  }

  public async create(payload: UserSignUpRequestDto): Promise<TUser> {
    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const user = {
      ...payload,
      password: hashedPassword
    };

    return await this.#userRepository.create(user);
  }
}

export { User };
