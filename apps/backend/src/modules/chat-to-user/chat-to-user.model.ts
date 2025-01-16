import { Schema, type Types, model } from 'mongoose';

import { DatabaseCollectionName } from '~/libs/modules/database/database.js';

interface ChatToUserDocument {
  chatId: Types.ObjectId;
  lastViewedAt: Date;
  userId: Types.ObjectId;
}

const ChatToUserSchema = new Schema<ChatToUserDocument>({
  chatId: { ref: 'Chat', required: true, type: Schema.Types.ObjectId },
  lastViewedAt: { required: true, type: Date },
  userId: { ref: 'Profile', required: true, type: Schema.Types.ObjectId }
});

const ChatToUserModel = model<ChatToUserDocument>(
  'ChatToUser',
  ChatToUserSchema,
  DatabaseCollectionName.CHAT_TO_USER
);

export { type ChatToUserDocument, ChatToUserModel };
