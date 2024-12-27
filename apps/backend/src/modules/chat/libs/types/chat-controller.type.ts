import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatController = {
  createChat: (
    options: ControllerAPIHandlerOptions<{
      body: ChatCreationRequestDto;
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatCreationResponseDto>>;

  getMyChats: (
    options: ControllerAPIHandlerOptions<{
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatsResponseDto>>;
};

export { type ChatController };
