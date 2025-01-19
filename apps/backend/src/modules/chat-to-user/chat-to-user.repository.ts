import { type Model } from 'mongoose';

import { type ChatToUserDocument } from './chat-to-user.model.js';
import { type ChatToUser as TChatToUser } from './libs/types/types.js';

class ChatToUser {
  private readonly model: Model<ChatToUserDocument>;

  public constructor(model: Model<ChatToUserDocument>) {
    this.model = model;
  }

  private mapToBusinessLogic(document: ChatToUserDocument): TChatToUser {
    return {
      chatId: document.chatId.toString(),
      lastViewedAt: document.lastViewedAt.toISOString(),
      userId: document.userId.toString()
    };
  }

  public async create(data: TChatToUser): Promise<TChatToUser> {
    const document = new this.model(data);

    const savedDocument = await document.save();

    return this.mapToBusinessLogic(savedDocument);
  }

  public async delete(
    chatId: string,
    userId: string
  ): Promise<TChatToUser | null> {
    const document = await this.model.findOneAndDelete({ chatId, userId });

    if (
      document &&
      'chatId' in document &&
      'userId' in document &&
      'lastViewedAt' in document
    ) {
      return this.mapToBusinessLogic(document as ChatToUserDocument);
    }

    return null;
  }

  public async get(
    chatId: string,
    userId: string
  ): Promise<TChatToUser | null> {
    const document = await this.model.findOne({ chatId, userId });

    return document ? this.mapToBusinessLogic(document) : null;
  }

  public async getAllByUserId(userId: string): Promise<TChatToUser[]> {
    const documents = await this.model.find({ userId });

    return documents.map(document => this.mapToBusinessLogic(document));
  }

  public async update(
    chatId: string,
    userId: string,
    lastViewedAt: Date
  ): Promise<TChatToUser | null> {
    const document = await this.model.findOneAndUpdate(
      { chatId, userId },
      { lastViewedAt },
      { new: true }
    );

    return document ? this.mapToBusinessLogic(document) : null;
  }
}

export { ChatToUser };
