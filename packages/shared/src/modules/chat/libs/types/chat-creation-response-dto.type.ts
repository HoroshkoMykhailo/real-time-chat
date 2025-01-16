import { type ValueOf } from '~/index.js';
import { type Profile } from '~/modules/profile/profile.js';

import { type ChatType } from '../../chat.js';

type ChatCreationResponseDto = {
  adminId?: string;
  chatPicture?: string;
  id: string;
  members: Profile[];
  name: string;
  type: ValueOf<typeof ChatType>;
  unreadCount: number;
};

export { type ChatCreationResponseDto };
