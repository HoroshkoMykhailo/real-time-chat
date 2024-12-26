import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto
} from './types.js';

type ChatController = {
  createChat: (
    options: ControllerAPIHandlerOptions<{
      body: ChatCreationRequestDto;
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatCreationResponseDto>>;
};

export { type ChatController };
