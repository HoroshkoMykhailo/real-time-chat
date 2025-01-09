import { type GetMessagesResponseDto } from './types.js';

type MessageApi = {
  getMessages(chatId: string): Promise<GetMessagesResponseDto>;
};

export { type MessageApi };
