import {
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageApi = {
  getMessages(chatId: string): Promise<GetMessagesResponseDto>;
  writeTextMessage(
    chatId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageApi };
