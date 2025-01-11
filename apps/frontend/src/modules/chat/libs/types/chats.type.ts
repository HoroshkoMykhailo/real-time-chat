import { type ChatsResponseDto, type Draft } from './types.js';

type Chats = Array<{ draft?: Draft } & ChatsResponseDto[number]>;

export { type Chats };
