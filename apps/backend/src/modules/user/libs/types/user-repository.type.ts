import { type Repository } from '~/libs/modules/database/database.js';

import { type UserDocument } from '../../user.model.js';
import { type User } from './types.js';

type UserRepository = {
  getByEmail(_email: string): Promise<UserDocument | null>;
} & Repository<User>;

export { type UserRepository };
