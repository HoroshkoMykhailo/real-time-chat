import { type ValueOf } from '~/libs/types/types.js';

import { type ProfileLanguage } from '../enums/enums.js';

type Profile = {
  createdAt: string;
  dataOfBirth?: Date;
  description?: string;
  id: string;
  language?: ValueOf<typeof ProfileLanguage>;
  profilePicture?: string;
  updatedAt: string;
  userId: string;
  username: string;
};

export { type Profile };
