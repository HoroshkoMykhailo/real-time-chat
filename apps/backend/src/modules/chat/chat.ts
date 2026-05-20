import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { chatToUserRepository } from '../chat-to-user/chat-to-user.js';
import {
  chatRepository,
  messageRepository
} from '../initializations/repositories.js';
import { profileRepository } from '../profile/profile.js';
import { Chat as ChatController } from './chat.controller.js';
import { Chat as ChatService } from './chat.service.js';

const chatService = new ChatService({
  chatRepository,
  chatToUserRepository,
  logger,
  messageRepository,
  profileRepository
});

const chatController = new ChatController({
  apiPath: APIPath.CHAT,
  chatService,
  logger
});

export { chatController };
