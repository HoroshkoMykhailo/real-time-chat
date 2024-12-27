import { APIPath } from '~/libs/enums/enums.js';
import { logger } from '~/libs/modules/logger/logger.js';

import { Message as MessageController } from './message.controller.js';
import { MessageModel } from './message.model.js';
import { Message as MessageRepository } from './message.repository.js';
import { Message as MessageService } from './message.service.js';

const messageRepository = new MessageRepository({
  messageModel: MessageModel
});

const messageService = new MessageService({
  messageRepository
});

const messageController = new MessageController({
  apiPath: APIPath.MESSAGE,
  logger,
  messageService
});

export { messageController };
export { type Message } from './libs/types/types.js';
export { type Message as MessageService } from './message.service.js';
