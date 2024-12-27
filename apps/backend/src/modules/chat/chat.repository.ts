import { Types } from 'mongoose';

import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type ChatDocument, type ChatModel } from './chat.model.js';
import { type Chat as TChat } from './libs/types/types.js';

type Constructor = Record<'chatModel', typeof ChatModel>;

class Chat extends AbstractRepository<ChatDocument, TChat> {
  public constructor({ chatModel }: Constructor) {
    super(chatModel);
  }

  public async getByProfileId(profileId: string): Promise<TChat[]> {
    const chats = await this.model.find({ members: profileId });

    return chats.map(chat => this.mapToBusinessLogic(chat));
  }

  protected mapAdditionalBusinessLogic(document: ChatDocument): Partial<TChat> {
    const result: Partial<TChat> = {
      members: document.members.map(member => member.toString()),
      type: document.type
    };

    if (document.adminId) {
      result.adminId = document.adminId.toString();
    }

    if (document.name) {
      result.name = document.name;
    }

    if (document.groupPicture) {
      result.groupPicture = document.groupPicture;
    }

    if (document.lastMessageId) {
      result.lastMessageId = document.lastMessageId.toString();
    }

    return result;
  }

  protected mapToDatabase(data: Partial<TChat>): Partial<ChatDocument> {
    const result: Partial<ChatDocument> = {};

    if (data.name) {
      result.name = data.name;
    }

    if (data.type) {
      result.type = data.type;
    }

    if (data.members) {
      result.members = data.members.map(member => new Types.ObjectId(member));
    }

    if (data.adminId) {
      result.adminId = new Types.ObjectId(data.adminId);
    }

    if (data.lastMessageId) {
      result.lastMessageId = new Types.ObjectId(data.lastMessageId);
    }

    if (data.groupPicture) {
      result.groupPicture = data.groupPicture;
    }

    return result;
  }

  public async setLastMessage(
    chatId: string,
    messageId: string
  ): Promise<void> {
    await this.model.updateOne(
      { _id: chatId },
      { $set: { lastMessageId: messageId } }
    );
  }
}

export { Chat };
