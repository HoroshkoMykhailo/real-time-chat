import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import {
  chatRepository,
  messageRepository,
  profileRepository
} from '../initializations/repositories.js';
import { translationService } from '../translation/translation.js';
import { Message as MessageController } from './message.controller.js';
import { Message as MessageService } from './message.service.js';

const messageService = new MessageService({
  chatRepository,
  messageRepository,
  profileRepository,
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
