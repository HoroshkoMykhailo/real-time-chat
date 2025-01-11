import { type User } from '~/modules/user/user.js';

import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageService = {
  createFile(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  deleteMessage(user: User, messageId: string): Promise<boolean>;

  getMessagesByChatId(
    user: User,
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<GetMessagesResponseDto>;

  updatePin(user: User, messageId: string): Promise<boolean>;

  updateText(
    user: User,
    messageId: string,
    data: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageService };
