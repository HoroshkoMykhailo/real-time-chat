import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { chatToUserRepository } from '../chat-to-user/chat-to-user.js';
import { chatRepository } from '../initializations/repositories.js';
import { messageRepository } from '../message/message.js';
import { profileRepository } from '../profile/profile.js';
import { Chat as ChatController } from './chat.controller.js';
import { Chat as ChatService } from './chat.service.js';

const chatService = new ChatService({
  chatRepository,
  chatToUserRepository,
  messageRepository,
  profileRepository
});

const chatController = new ChatController({
  apiPath: APIPath.CHAT,
  chatService,
  logger
});

export { chatController };
export { chatRepository } from '../initializations/repositories.js';
export { type Chat as ChatService } from './chat.service.js';
export {
  ChatValidationMessage,
  ChatValidationRule
} from './libs/enums/enums.js';
export { type Chat } from './libs/types/types.js';
