import { encryption } from '~/libs/modules/encryption/encryption.js';

import { UserModel } from './user.model.js';
import { User as UserRepository } from './user.repository.js';
import { User as UserService } from './user.service.js';

const userRepository = new UserRepository({
  userModel: UserModel
});
const userService = new UserService({
  encryption,
  userRepository
});

export { userService };
export {
  UserPayloadKey,
  UserValidationMessage,
  UserValidationRule
} from './libs/enums/enums.js';
export { type UserService } from './libs/types/types.js';
