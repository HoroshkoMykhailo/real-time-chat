import { Schema, type Types, model } from 'mongoose';

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
  profileId: Types.ObjectId;
  role: ValueOf<typeof UserRole>;
}

const UserSchema = new Schema<UserDocument>({
  email: { required: true, type: String, unique: true },
  password: { required: true, type: String },
  profileId: { ref: 'Profile', required: true, type: Schema.Types.ObjectId },
  role: { enum: Object.values(UserRole), required: true, type: String }
});

UserSchema.add(AbstractSchema);

const UserModel = model<UserDocument>(
  'User',
  UserSchema,
  DatabaseCollectionName.USERS
);

export { type UserDocument, UserModel };
