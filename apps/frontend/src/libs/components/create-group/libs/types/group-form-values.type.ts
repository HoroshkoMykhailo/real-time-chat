import { type ValueOf } from '~/libs/types/types.js';
import { type ChatType } from '~/modules/chat/chat.js';

type GroupFormValues = {
  groupPicture: File | null;
  members: string[];
  name: string;
  type: ValueOf<typeof ChatType>;
};

export { type GroupFormValues };
