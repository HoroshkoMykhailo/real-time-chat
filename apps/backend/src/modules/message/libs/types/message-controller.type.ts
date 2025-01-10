import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type GetMessagesResponseDto,
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

  deleteMessage: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<boolean>>;

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
  ) => Promise<ControllerAPIHandlerResponse<GetMessagesResponseDto>>;

  updatePinMessage: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<boolean>>;

  updateTextMessage: (
    options: ControllerAPIHandlerOptions<{
      body: TextMessageRequestDto;
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>>;
};

export { type MessageController };
