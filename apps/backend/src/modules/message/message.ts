import { type Server } from 'socket.io';

import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';
import { socketManager } from '~/libs/modules/socket/socket.js';

import { chatToUserRepository } from '../chat-to-user/chat-to-user.js';
import {
  chatRepository,
  messageRepository,
  profileRepository
} from '../initializations/repositories.js';
import { transcriptionService } from '../transcription/transcription.js';
import { translationService } from '../translation/translation.js';
import { Message as MessageController } from './message.controller.js';
import { Message as MessageService } from './message.service.js';

const messageService = new MessageService({
  chatRepository,
  chatToUserRepository,
  getIo: (): Server => socketManager.getIo(),
  messageRepository,
  profileRepository,
  transcriptionService,
  translationService
});

const messageController = new MessageController({
  apiPath: APIPath.MESSAGE,
  logger,
  messageService
});

export { messageController };
export { messageRepository } from '../initializations/repositories.js';
export { MessageLanguage } from './libs/enums/enums.js';
export { type Message } from './libs/types/types.js';
export { type Message as MessageService } from './message.service.js';
