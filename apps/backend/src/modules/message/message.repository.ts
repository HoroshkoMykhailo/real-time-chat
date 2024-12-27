import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type Message as TMessage } from './libs/types/types.js';
import { type MessageDocument, type MessageModel } from './message.model.js';

type Constructor = Record<'messageModel', typeof MessageModel>;

class Message extends AbstractRepository<MessageDocument, TMessage> {
  public constructor({ messageModel }: Constructor) {
    super(messageModel);
  }

  protected mapAdditionalBusinessLogic(
    document: MessageDocument
  ): Partial<TMessage> {
    return {
      chatId: document.chatId.toString(),
      content: document.content,
      isPinned: document.isPinned,
      senderId: document.senderId.toString(),
      status: document.status,
      type: document.type
    };
  }

  protected mapToDatabase(data: Partial<TMessage>): Partial<MessageDocument> {
    const result: Partial<MessageDocument> = {};

    if (data.content) {
      result.content = data.content;
    }

    if (data.isPinned) {
      result.isPinned = data.isPinned;
    }

    if (data.status) {
      result.status = data.status;
    }

    return result;
  }
}

export { Message };
