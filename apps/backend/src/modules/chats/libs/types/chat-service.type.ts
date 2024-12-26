import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto
} from './types.js';

type ChatService = {
  create(
    user: User,
    data: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto>;
};

export { type ChatService };
