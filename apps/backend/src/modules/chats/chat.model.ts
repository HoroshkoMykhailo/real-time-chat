import { Schema, type Types, model } from 'mongoose';

import {
  type AbstractDocument,
  AbstractSchema,
  DatabaseCollectionName
} from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

import { ChatType } from './libs/enums/enums.js';

interface ChatDocument extends AbstractDocument {
  adminId?: Types.ObjectId;
  groupPicture?: string;
  members: Types.ObjectId[];
  name?: string;
  type: ValueOf<typeof ChatType>;
}

const ChatSchema = new Schema<ChatDocument>({
  adminId: { ref: 'Profile', type: Schema.Types.ObjectId },
  groupPicture: { type: String },
  members: [{ ref: 'Profile', required: true, type: Schema.Types.ObjectId }],
  name: { type: String },
  type: { enum: Object.values(ChatType), required: true, type: String }
});

ChatSchema.add(AbstractSchema);

const ChatModel = model<ChatDocument>(
  'Chat',
  ChatSchema,
  DatabaseCollectionName.CHATS
);

export { type ChatDocument, ChatModel };
