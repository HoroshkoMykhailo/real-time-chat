import { type ValueOf } from '~/libs/types/types.js';

import { type MessageLanguage } from '../enums/enums.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from './types.js';

type MessageApi = {
  deleteMessage(messageId: string): Promise<boolean>;
  downloadFile(messageId: string): Promise<Blob>;

  getMessages(chatId: string): Promise<GetMessagesResponseDto>;
  getPinnedMessages(chatId: string): Promise<GetMessagesResponseDto>;

  loadAfterMessages(
    chatId: string,
    afterTime: string
  ): Promise<GetMessagesResponseDto>;

  loadBeforeMessages(
    chatId: string,
    beforeTime: string
  ): Promise<GetMessagesResponseDto>;

  transcribeMessage(messageId: string): Promise<MessageCreationResponseDto>;

  translateMessage(
    messageId: string,
    language: ValueOf<typeof MessageLanguage>
  ): Promise<TranslateMessageResponseDto>;

  updatePinMessage(messageId: string): Promise<boolean>;

  updateTextMessage(
    messageId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;

  writeAudioMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto>;

  writeFileMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto>;

  writeImageMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto>;

  writeTextMessage(
    chatId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
  writeVideoMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageApi };
