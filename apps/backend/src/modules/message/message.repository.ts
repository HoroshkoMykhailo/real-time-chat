import { Types } from 'mongoose';

import { AbstractRepository } from '~/libs/modules/database/database.js';

import { DEFAULT_LIMIT, LIMIT_DIVISOR } from './libs/constants/constants.js';
import {
  type FilterType,
  type Message as TMessage
} from './libs/types/types.js';
import { type MessageDocument, type MessageModel } from './message.model.js';

type Constructor = Record<'messageModel', typeof MessageModel>;

class Message extends AbstractRepository<MessageDocument, TMessage> {
  public constructor({ messageModel }: Constructor) {
    super(messageModel);
  }

  public async deleteByChatId(chatId: string): Promise<void> {
    await this.model.deleteMany({ chatId });
  }

  public async getMessagesByChatId({
    after,
    before,
    chatId,
    limit
  }: {
    after?: string;
    before?: string;
    chatId: string;
    limit?: number;
  }): Promise<TMessage[]> {
    const chatObjectId = new Types.ObjectId(chatId);

    const queryFilter: FilterType = { chatId: chatObjectId };

    if (after && before && after === before) {
      const halfLimit = limit
        ? Math.floor(limit / LIMIT_DIVISOR)
        : Math.floor(DEFAULT_LIMIT / LIMIT_DIVISOR);
      const centerDate = new Date(after);

      const messagesBefore = await this.model
        .find({ chatId: chatObjectId, createdAt: { $lte: centerDate } })
        .sort({ createdAt: -1 })
        .limit(halfLimit);

      const messagesAfter = await this.model
        .find({ chatId: chatObjectId, createdAt: { $gt: centerDate } })
        .sort({ createdAt: -1 })
        .limit(halfLimit);

      const combinedMessages = [
        ...messagesBefore.toReversed(),
        ...messagesAfter
      ];

      return combinedMessages.map(message => this.mapToBusinessLogic(message));
    }

    if (after) {
      queryFilter.createdAt = {
        ...queryFilter.createdAt,
        $gt: new Date(after)
      };
    }

    if (before) {
      queryFilter.createdAt = {
        ...queryFilter.createdAt,
        $lt: new Date(before)
      };
    }

    const messages = await this.model
      .find({ ...queryFilter })
      .sort({ createdAt: -1 })
      .limit(limit ?? DEFAULT_LIMIT);

    return messages.map(message => this.mapToBusinessLogic(message));
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
