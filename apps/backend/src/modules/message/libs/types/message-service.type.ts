import { type ValueOf } from '~/libs/types/types.js';
import { type User } from '~/modules/user/user.js';

import { type MessageLanguage } from '../enums/enums.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from './types.js';

type MessageService = {
  createAudio(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  createFile(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  createImage(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  createVideo(
    user: User,
    data: FileMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;

  deleteMessage(user: User, messageId: string): Promise<boolean>;

  downloadFile(user: User, messageId: string): Promise<Blob>;

  getMessagesByChatId(
    user: User,
    chatId: string,
    query: {
      after?: string;
      before?: string;
      limit?: number;
    }
  ): Promise<GetMessagesResponseDto>;

  translateMessage(
    user: User,
    messageId: string,
    language: ValueOf<typeof MessageLanguage>
  ): Promise<TranslateMessageResponseDto>;

  updatePin(user: User, messageId: string): Promise<boolean>;

  updateText(
    user: User,
    messageId: string,
    data: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageService };
