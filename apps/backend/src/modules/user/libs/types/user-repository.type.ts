import { type Repository } from '~/libs/modules/database/database.js';

import { type User } from './types.js';

type UserRepository = {
  getByEmail(_email: string): Promise<User | null>;
} & Repository<User>;

export { type UserRepository };
