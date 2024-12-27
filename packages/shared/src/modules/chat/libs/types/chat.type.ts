import { type ValueOf } from '~/libs/types/types.js';

import { type ChatType } from '../enums/enums.js';

type Chat = {
  adminId?: string;
  createdAt: string;
  groupPicture?: string;
  id: string;
  members: string[];
  name?: string;
  type: ValueOf<typeof ChatType>;
  updatedAt: string;
};

export { type Chat };
