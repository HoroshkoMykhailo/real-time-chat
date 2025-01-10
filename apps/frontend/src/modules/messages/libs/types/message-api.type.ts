import {
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageApi = {
  deleteMessage(messageId: string): Promise<boolean>;
  getMessages(chatId: string): Promise<GetMessagesResponseDto>;

  updateTextMessage(
    messageId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;

  writeTextMessage(
    chatId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageApi };
