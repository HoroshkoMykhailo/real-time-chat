import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatService = {
  create(
    user: User,
    data: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto>;

  getChat(id: string, user: User): Promise<ChatGetResponseDto>;

  getMyChats(user: User): Promise<ChatsResponseDto>;
};

export { type ChatService };
