import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './types.js';

type MessageController = {
  createFileMessage: (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>>;

  createImageMessage: (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>>;

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

  downloadFileMessage: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<Blob>>;

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
