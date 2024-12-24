import { Schema, model } from 'mongoose';

import {
  type AbstractDocument,
  AbstractSchema,
  DatabaseCollectionName
} from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

import { ProfileLanguage } from './libs/enums/enums.js';

interface ProfileDocument extends AbstractDocument {
  dateOfBirth?: string;
  description?: string;
  language: ValueOf<typeof ProfileLanguage>;
  profilePicture?: string;
  username: string;
}

const ProfileSchema = new Schema<ProfileDocument>({
  dateOfBirth: { type: String },
  description: { type: String },
  language: {
    default: ProfileLanguage.ENGLISH,
    enum: Object.values(ProfileLanguage),
    type: String
  },
  profilePicture: { type: String },
  username: { required: true, type: String }
});

ProfileSchema.add(AbstractSchema);

const ProfileModel = model<ProfileDocument>(
  'Profile',
  ProfileSchema,
  DatabaseCollectionName.PROFILES
);

export { type ProfileDocument, ProfileModel };
