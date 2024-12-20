import { type MultipartFile, type MultipartValue } from '@fastify/multipart';

import { type ValueOf } from '~/libs/types/types.js';

import { type ProfileLanguage } from '../enums/enums.js';

type UserProfileCreationRequestDto = {
  dateOfBirth?: MultipartValue<string>;
  description?: MultipartValue<string>;
  language?: MultipartValue<ValueOf<typeof ProfileLanguage>>;
  profilePicture?: MultipartFile;
  username?: MultipartValue<string>;
};

export { type UserProfileCreationRequestDto };
