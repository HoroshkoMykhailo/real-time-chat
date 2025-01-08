import { type ValueOf } from '~/index.js';

import { type ChatType } from '../../chat.js';

type ChatUpdateResponseDto = {
  chatPicture?: string;
  createdAt: string;
  id: string;
  name?: string;
  type: ValueOf<typeof ChatType>;
  updatedAt: string;
};

export { type ChatUpdateResponseDto };
