import { type UserSignUpRequestDto } from '~/modules/auth/libs/types/types.js';

import { type UserDocument } from '../../user.model.js';
import {
  type User,
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto
} from './types.js';

type UserService = {
  create(payload: UserSignUpRequestDto): Promise<User>;
  find(id: string): Promise<User>;
  getByEmail(email: string): Promise<UserDocument>;
  mapUser(document: UserDocument): User;
  updateProfile(
    sender: User,
    id: string,
    data: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto>;
};

export { type UserService };
