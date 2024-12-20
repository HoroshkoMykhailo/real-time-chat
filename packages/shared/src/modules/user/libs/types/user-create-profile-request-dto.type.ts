import { type ValueOf } from '~/libs/types/types.js';
import { type ProfileLanguage } from '~/modules/profile/profile.js';

type UserProfileCreationRequestDto = {
  dateOfBirth?: string;
  description?: string;
  language?: ValueOf<typeof ProfileLanguage>;
  profilePicture?: File | null;
  username?: string;
};

export { type UserProfileCreationRequestDto };
