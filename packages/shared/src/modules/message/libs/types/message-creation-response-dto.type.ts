import { type ValueOf } from '~/libs/types/types.js';
import { type Profile } from '~/modules/profile/profile.js';

import { type MessageStatus, type MessageType } from '../../message.js';

type MessageCreationResponseDto = {
  chatId: string;
  content: string;
  createdAt: string;
  fileUrl?: string;
  id: string;
  isPinned: boolean;
  sender: Profile;
  status: ValueOf<typeof MessageStatus>;
  type: ValueOf<typeof MessageType>;
  updatedAt: string;
};

export { type MessageCreationResponseDto };
