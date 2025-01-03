import { type ChatGetResponseDto, type ChatsResponseDto } from './types.js';

type ChatApi = {
  getChat(chatId: string): Promise<ChatGetResponseDto>;
  getMyChats(): Promise<ChatsResponseDto>;
  leaveChat(chatId: string): Promise<ChatGetResponseDto | null>;
};

export { type ChatApi };
