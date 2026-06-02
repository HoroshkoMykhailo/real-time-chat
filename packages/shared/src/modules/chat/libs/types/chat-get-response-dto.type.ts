import { type ValueOf } from '../../../../libs/types/types.js';
import { type MessageType } from '../../../message/message.js';
import { type Profile } from '../../../profile/profile.js';

type ChatGetResponseDto = {
  adminId?: string;
  lastPinnedMessage?: {
    content: string;
    createdAt: string;
    fileUrl?: string;
    id: string;
    senderName: string;
    type: ValueOf<typeof MessageType>;
  };
  members: Profile[];
};

export { type ChatGetResponseDto };
