import { type ValueOf } from '~/index.js';
import { type Profile } from '~/modules/profile/profile.js';

import { type ChatType } from '../../chat.js';

type ChatCreationResponseDto = {
  admin?: {
    id: string;
    profile: Profile;
  };
  createdAt: string;
  groupPicture?: string;
  id: string;
  members: Profile[];
  name?: string;
  type: ValueOf<typeof ChatType>;
  updatedAt: string;
};

export { type ChatCreationResponseDto };
