import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageApi = {
  deleteMessage(messageId: string): Promise<boolean>;
  downloadFile(messageId: string): Promise<Blob>;

  getMessages(chatId: string): Promise<GetMessagesResponseDto>;

  updatePinMessage(messageId: string): Promise<boolean>;

  updateTextMessage(
    messageId: string,
    content: TextMessageRequestDto
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
};

export { type MessageApi };
