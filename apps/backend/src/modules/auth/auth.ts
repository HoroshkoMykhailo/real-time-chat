import { APIPath } from '~/libs/enums/enums.js';
import { config } from '~/libs/modules/config/config.js';
import { encryption } from '~/libs/modules/encryption/encryption.js';
import { logger } from '~/libs/modules/logger/logger.js';
import { token } from '~/libs/modules/token/token.js';
import { userService } from '~/modules/user/user.js';

import { Auth as AuthController } from './auth.controller.js';
import { Auth as AuthService } from './auth.service.js';

const authService = new AuthService({
  config,
  encryptionService: encryption,
  tokenService: token,
  userService
});
const authController = new AuthController({
  apiPath: APIPath.AUTH,
  authService,
  logger
});

export { authController };
