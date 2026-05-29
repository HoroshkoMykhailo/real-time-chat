import { type Repository } from '~/libs/modules/database/database.js';

import { type UserDocument } from '../../user.model.js';
import { type User } from './types.js';

type UserRepository = Repository<User> & {
  getByEmail(_email: string): Promise<null | UserDocument>;

  getByGoogleSub(_googleSub: string): Promise<null | UserDocument>;

  linkGoogleAccount(
    _userId: string,
    _googleSub: string
  ): Promise<null | UserDocument>;

  updatePartialById(
    _id: string,
    _patch: Partial<Pick<User, 'email' | 'role'>>
  ): Promise<null | User>;
};

export { type UserRepository };
