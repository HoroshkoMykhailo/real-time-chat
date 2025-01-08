import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatApi = {
  addMembers(chatId: string, members: string[]): Promise<ChatGetResponseDto>;
  createChat(payload: ChatCreationRequestDto): Promise<ChatCreationResponseDto>;
  deleteChat(chatId: string): Promise<boolean>;
  getChat(chatId: string): Promise<ChatGetResponseDto>;
  getMyChats(): Promise<ChatsResponseDto>;
  leaveChat(chatId: string): Promise<ChatGetResponseDto | null>;
  removeMember(chatId: string, memberId: string): Promise<ChatGetResponseDto>;
  updateGroup(
    chatId: string,
    payload: ChatUpdateRequestDto
  ): Promise<ChatUpdateResponseDto>;
};

export { type ChatApi };
