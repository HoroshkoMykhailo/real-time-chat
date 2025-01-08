import { type User } from '~/modules/user/user.js';

import {
  type Message,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageService = {
  createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  getMessagesByChatId(
    user: User,
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<Message[]>;
};

export { type MessageService };
