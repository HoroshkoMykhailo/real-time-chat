import { type ValueOf } from '~/libs/types/types.js';

import { type ChatType } from '../enums/chat-type.enum.js';

type ChatsResponseDto = {
  chatPicture?: string;
  id: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderName: string;
  };
  name: string;
  type: ValueOf<typeof ChatType>;
}[];

export { type ChatsResponseDto };
