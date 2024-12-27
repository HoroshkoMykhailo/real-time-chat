import { type User } from '~/modules/user/user.js';

import {
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageService = {
  createText(
    user: User,
    data: TextMessageRequestDto,
    chatId: string
  ): Promise<MessageCreationResponseDto>;
};

export { type MessageService };
