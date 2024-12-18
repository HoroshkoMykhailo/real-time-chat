import { type UserSignUpRequestDto } from '~/modules/auth/libs/types/types.js';

import { type UserDocument } from '../../user.model.js';
import { type User } from './types.js';

type UserService = {
  create(payload: UserSignUpRequestDto): Promise<User>;
  getByEmail(email: string): Promise<UserDocument>;
  mapUser(document: UserDocument): User;
};

export { type UserService };
