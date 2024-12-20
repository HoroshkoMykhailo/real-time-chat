import { type ValueOf } from '~/libs/types/types.js';

import { type ProfileLanguage } from '../enums/enums.js';

type Profile = {
  createdAt: string;
  dateOfBirth?: string;
  description?: string;
  id: string;
  language: ValueOf<typeof ProfileLanguage>;
  profilePicture?: string;
  updatedAt: string;
  username: string;
};

export { type Profile };
