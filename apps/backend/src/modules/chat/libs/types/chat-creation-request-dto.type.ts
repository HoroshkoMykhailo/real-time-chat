import { type MultipartFile, type MultipartValue } from '@fastify/multipart';

import { type ValueOf } from '~/libs/types/types.js';

import { type ChatType } from '../enums/enums.js';

type ChatCreationRequestDto = {
  groupPicture?: MultipartFile;
  members: MultipartValue<string>;
  name?: MultipartValue<string>;
  type: MultipartValue<ValueOf<typeof ChatType>>;
};

export { type ChatCreationRequestDto };
