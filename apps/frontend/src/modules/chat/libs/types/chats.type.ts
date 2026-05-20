import { type ChatsResponseDto, type Draft } from './types.js';

type Chats = Array<ChatsResponseDto[number] & { draft?: Draft }>;

export { type Chats };
