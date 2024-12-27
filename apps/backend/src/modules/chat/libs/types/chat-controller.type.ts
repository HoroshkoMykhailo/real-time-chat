import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './types.js';

type ChatController = {
  createChat: (
    options: ControllerAPIHandlerOptions<{
      body: ChatCreationRequestDto;
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatCreationResponseDto>>;

  getChat: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>>;

  getMyChats: (
    options: ControllerAPIHandlerOptions<{
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatsResponseDto>>;
};

export { type ChatController };
