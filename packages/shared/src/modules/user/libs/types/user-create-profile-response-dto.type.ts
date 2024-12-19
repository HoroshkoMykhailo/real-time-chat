import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/profile.js';

type UserProfileCreationResponseDto = {
  dateOfBirth?: string;
  description?: string;
  language?: ValueOf<typeof ProfileLanguage>;
  profilePicture?: string;
  username?: string;
};

export { type UserProfileCreationResponseDto };
