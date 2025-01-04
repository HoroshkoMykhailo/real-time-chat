import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatApi = {
  createChat(payload: ChatCreationRequestDto): Promise<ChatCreationResponseDto>;
  getChat(chatId: string): Promise<ChatGetResponseDto>;
  getMyChats(): Promise<ChatsResponseDto>;
  leaveChat(chatId: string): Promise<ChatGetResponseDto | null>;
};

export { type ChatApi };
