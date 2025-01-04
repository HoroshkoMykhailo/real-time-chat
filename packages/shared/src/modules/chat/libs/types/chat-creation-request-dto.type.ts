import { type ValueOf } from '~/libs/types/types.js';

import { type ChatType } from '../enums/enums.js';

type ChatCreationRequestDto = {
  groupPicture?: File | null;
  members: string[];
  name?: string;
  type: ValueOf<typeof ChatType>;
};

export { type ChatCreationRequestDto };
