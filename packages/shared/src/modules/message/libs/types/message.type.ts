import { type ValueOf } from '~/libs/types/types.js';

import { type MessageStatus, type MessageType } from '../enums/enums.js';

type Message = {
  chatId: string;
  content: string;
  createdAt: string;
  id: string;
  isPinned: boolean;
  senderId: string;
  status: ValueOf<typeof MessageStatus>;
  type: ValueOf<typeof MessageType>;
  updatedAt: string;
};

export { type Message };
