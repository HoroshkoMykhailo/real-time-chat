import { type ChatsResponseDto } from './types.js';

type ChatApi = {
  getMyChats(): Promise<ChatsResponseDto>;
};

export { type ChatApi };
