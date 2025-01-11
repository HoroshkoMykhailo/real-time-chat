import { Schema, type Types, model } from 'mongoose';

import {
  type AbstractDocument,
  AbstractSchema,
  DatabaseCollectionName
} from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

import { MessageStatus, MessageType } from './libs/enums/enums.js';

interface MessageDocument extends AbstractDocument {
  chatId: Types.ObjectId;
  content: string;
  fileUrl?: string;
  isPinned: boolean;
  senderId: Types.ObjectId;
  status: ValueOf<typeof MessageStatus>;
  type: ValueOf<typeof MessageType>;
}

const MessageSchema = new Schema<MessageDocument>({
  chatId: { ref: 'Chat', required: true, type: Schema.Types.ObjectId },
  content: { required: true, type: String },
  fileUrl: { type: String },
  isPinned: { required: true, type: Boolean },
  senderId: { ref: 'User', required: true, type: Schema.Types.ObjectId },
  status: { enum: Object.values(MessageStatus), required: true, type: String },
  type: { enum: Object.values(MessageType), required: true, type: String }
});

MessageSchema.add(AbstractSchema);

const MessageModel = model<MessageDocument>(
  'Message',
  MessageSchema,
  DatabaseCollectionName.MESSAGES
);

export { type MessageDocument, MessageModel };
