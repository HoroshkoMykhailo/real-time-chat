import { APIPath } from '~/libs/enums/enums.js';
import { encryption } from '~/libs/modules/encryption/encryption.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { userRepository } from '../initializations/repositories.js';
import { profileRepository } from '../profile/profile.js';
import { User as UserController } from './user.controller.js';
import { User as UserService } from './user.service.js';

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
export { userRepository } from '../initializations/repositories.js';
export { UserRole } from './libs/enums/enums.js';
export { type User } from './libs/types/types.js';
export { type User as UserService } from './user.service.js';
