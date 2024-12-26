import { Types } from 'mongoose';

import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type ChatDocument, type ChatModel } from './chat.model.js';
import { type Chat as TChat } from './libs/types/types.js';

type Constructor = Record<'chatModel', typeof ChatModel>;

class Chat extends AbstractRepository<ChatDocument, TChat> {
  public constructor({ chatModel }: Constructor) {
    super(chatModel);
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

    if (data.groupPicture) {
      result.groupPicture = data.groupPicture;
    }

    return result;
  }
}

export { Chat };
