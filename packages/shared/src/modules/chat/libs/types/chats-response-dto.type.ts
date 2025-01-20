import { type ValueOf } from '~/libs/types/types.js';
import { type MessageType } from '~/modules/message/message.js';

import { type ChatType } from '../enums/chat-type.enum.js';

type ChatsResponseDto = {
  chatPicture?: string;
  id: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    fileUrl?: string;
    id: string;
    senderName: string;
    type: ValueOf<typeof MessageType>;
  };
  memberCount?: number;
  name: string;
  type: ValueOf<typeof ChatType>;
  unreadCount: number;
}[];

export { type ChatsResponseDto };
