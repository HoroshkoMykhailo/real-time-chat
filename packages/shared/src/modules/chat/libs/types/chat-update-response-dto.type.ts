import { type ValueOf } from '~/index.js';

import { type ChatType } from '../../chat.js';

type ChatUpdateResponseDto = {
  createdAt: string;
  groupPicture?: string;
  id: string;
  name?: string;
  type: ValueOf<typeof ChatType>;
  updatedAt: string;
};

export { type ChatUpdateResponseDto };
