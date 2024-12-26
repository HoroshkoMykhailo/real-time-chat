import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { profileRepository } from '../profile/profile.js';
import { Chat as ChatController } from './chat.controller.js';
import { ChatModel } from './chat.model.js';
import { Chat as ChatRepository } from './chat.repository.js';
import { Chat as ChatService } from './chat.service.js';

const chatRepository = new ChatRepository({
  chatModel: ChatModel
});

const chatService = new ChatService({
  chatRepository,
  profileRepository
});

const chatController = new ChatController({
  apiPath: APIPath.CHAT,
  chatService,
  logger
});

export { chatController };
export { type Chat as ChatService } from './chat.service.js';
export {
  ChatValidationMessage,
  ChatValidationRule
} from './libs/enums/enums.js';
export { type Chat } from './libs/types/types.js';
