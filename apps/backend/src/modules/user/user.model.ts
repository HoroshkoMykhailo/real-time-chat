import { Schema, model } from 'mongoose';

import {
  type AbstractDocument,
  AbstractSchema,
  DatabaseCollectionName
} from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

import { UserRole } from './libs/enums/enums.js';

interface UserDocument extends AbstractDocument {
  email: string;
  password: string;
  role: ValueOf<typeof UserRole>;
}

const UserSchema = new Schema<UserDocument>({
  email: { required: true, type: String, unique: true },
  password: { required: true, type: String },
  role: { enum: Object.values(UserRole), required: true, type: String }
});

UserSchema.add(AbstractSchema);

const UserModel = model<UserDocument>(
  'User',
  UserSchema,
  DatabaseCollectionName.USERS
);

export { type UserDocument, UserModel };
