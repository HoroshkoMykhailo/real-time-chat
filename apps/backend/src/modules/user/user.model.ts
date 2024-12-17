import { Schema, model } from 'mongoose';

import {
  type AbstractDocument,
  AbstractSchema,
  DatabaseCollectionName
} from '~/libs/modules/database/database.js';

interface UserDocument extends AbstractDocument {
  email: string;
  password: string;
}

const UserSchema = new Schema<UserDocument>({
  email: { required: true, type: String, unique: true },
  password: { required: true, type: String }
});

UserSchema.add(AbstractSchema);

const UserModel = model<UserDocument>(
  'User',
  UserSchema,
  DatabaseCollectionName.USERS
);

export { type UserDocument, UserModel };
