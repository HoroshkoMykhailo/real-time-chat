import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatService = {
  addMembers(
    id: string,
    user: User,
    members: string[]
  ): Promise<ChatGetResponseDto>;

  create(
    user: User,
    data: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto>;
  getChat(id: string, user: User): Promise<ChatGetResponseDto>;

  getMyChats(user: User): Promise<ChatsResponseDto>;

  removeMember(
    id: string,
    user: User,
    member: string
  ): Promise<ChatGetResponseDto>;
};

export { type ChatService };
