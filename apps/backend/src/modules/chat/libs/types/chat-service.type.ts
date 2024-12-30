import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
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

  deleteChat(id: string, user: User): Promise<boolean>;
  getChat(id: string, user: User): Promise<ChatGetResponseDto>;

  getMyChats(user: User): Promise<ChatsResponseDto>;

  leaveChat(id: string, user: User): Promise<ChatGetResponseDto | null>;
  removeMember(
    id: string,
    user: User,
    member: string
  ): Promise<ChatGetResponseDto>;
  updateChat(
    id: string,
    user: User,
    data: ChatUpdateRequestDto
  ): Promise<ChatUpdateResponseDto>;
};

export { type ChatService };
