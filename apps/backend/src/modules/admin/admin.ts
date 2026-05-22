import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { chatService } from '../chat/chat.js';
import {
  chatRepository,
  messageRepository,
  profileRepository,
  userRepository
} from '../initializations/repositories.js';
import { messageService } from '../message/message.js';
import { Admin as AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

const adminService = new AdminService({
  chatRepository,
  chatService,
  messageRepository,
  messageService,
  profileRepository,
  userRepository
});

const adminController = new AdminController({
  adminService,
  apiPath: APIPath.ADMIN,
  logger
});

export { adminController };
