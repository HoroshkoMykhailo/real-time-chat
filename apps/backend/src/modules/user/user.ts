import { APIPath } from '~/libs/enums/enums.js';
import { encryption } from '~/libs/modules/encryption/encryption.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { profileRepository } from '../profile/profile.js';
import { User as UserController } from './user.controller.js';
import { UserModel } from './user.model.js';
import { User as UserRepository } from './user.repository.js';
import { User as UserService } from './user.service.js';

const userRepository = new UserRepository({
  userModel: UserModel
});

const userService = new UserService({
  encryption,
  profileRepository,
  userRepository
});

const userController = new UserController({
  apiPath: APIPath.USER,
  logger,
  userService
});

export { userController, userService };
export {
  UserPayloadKey,
  UserValidationMessage,
  UserValidationRule
} from './libs/enums/enums.js';
export { type User } from './libs/types/types.js';
export { type User as UserService } from './user.service.js';
