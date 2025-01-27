import { Types } from 'mongoose';

import { AbstractRepository } from '~/libs/modules/database/database.js';

import { DEFAULT_LIMIT, LIMIT_DIVISOR } from './libs/constants/constants.js';
import {
  type FilterType,
  type Message as TMessage
} from './libs/types/types.js';
import { type MessageDocument, type MessageModel } from './message.model.js';

const POSITIVE_VALUE = 1;

type Constructor = Record<'messageModel', typeof MessageModel>;

class Message extends AbstractRepository<MessageDocument, TMessage> {
  public constructor({ messageModel }: Constructor) {
    super(messageModel);
  }

  public async deleteByChatId(chatId: string): Promise<void> {
    await this.model.deleteMany({ chatId });
  }

  public async getLastMessage(chatId: string): Promise<TMessage | null> {
    const lastMessage = await this.model
      .findOne({ chatId })
      .sort({ createdAt: -1 })
      .limit(POSITIVE_VALUE);

    return lastMessage ? this.mapToBusinessLogic(lastMessage) : null;
  }

  public async getLastPinnedMessageByChatId(
    chatId: string
  ): Promise<TMessage | null> {
    const lastMessage = await this.model
      .findOne({ chatId, isPinned: true })
      .sort({ createdAt: -1 })
      .limit(POSITIVE_VALUE);

    return lastMessage ? this.mapToBusinessLogic(lastMessage) : null;
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
        .sort({ createdAt: 1 })
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

    return messages.map(message => this.mapToBusinessLogic(message)).reverse();
  }

  public async getPinnedMessagesByChatId(chatId: string): Promise<TMessage[]> {
    const messages = await this.model
      .find({ chatId, isPinned: true })
      .sort({ createdAt: 1 });

    return messages.map(message => this.mapToBusinessLogic(message));
  }

  public async getUnreadCount(
    chatId: string,
    afterDate: Date
  ): Promise<number> {
    return await this.model.countDocuments({
      chatId,
      createdAt: { $gt: afterDate }
    });
  }

  protected mapAdditionalBusinessLogic(
    document: MessageDocument
  ): Partial<TMessage> {
    const result: Partial<TMessage> = {
      chatId: document.chatId.toString(),
      content: document.content,
      isPinned: document.isPinned,
      senderId: document.senderId.toString(),
      status: document.status,
      type: document.type
    };

    if (document.fileUrl) {
      result.fileUrl = document.fileUrl;
    }

    return result;
  }

  protected mapToDatabase(data: Partial<TMessage>): Partial<MessageDocument> {
    const result: Partial<MessageDocument> = {};

    if (data.content) {
      result.content = data.content;
    }

    if (data.isPinned !== undefined) {
      result.isPinned = data.isPinned;
    }

    if (data.status) {
      result.status = data.status;
    }

    return result;
  }
}

export { Message };
