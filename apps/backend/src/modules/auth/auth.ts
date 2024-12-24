import { APIPath } from '~/libs/enums/enums.js';
import { encryption } from '~/libs/modules/encryption/encryption.js';
import { logger } from '~/libs/modules/logger/logger.js';
import { token } from '~/libs/modules/token/token.js';
import { userService } from '~/modules/user/user.js';

import { Auth as AuthController } from './auth.controller.js';
import { Auth as AuthService } from './auth.service.js';

const authService = new AuthService({
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
export { AuthApiPath } from './libs/enums/enums.js';
export {
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';
