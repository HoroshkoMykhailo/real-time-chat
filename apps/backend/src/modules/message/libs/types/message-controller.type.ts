import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type Message,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageController = {
  createTextMessage: (
    options: ControllerAPIHandlerOptions<{
      body: TextMessageRequestDto;
      params: { chatId: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>>;

  getMessagesByChatId: (
    options: ControllerAPIHandlerOptions<{
      params: { chatId: string };
      query: {
        after?: string;
        before?: string;
        limit?: number;
      };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<Message[]>>;
};

export { type MessageController };
