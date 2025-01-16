import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { type User } from '~/modules/user/user.js';

import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
  type ChatsResponseDto,
  type UpdateLastViewedTimeResponseDto
} from './types.js';

type ChatController = {
  addMembers: (
    options: ControllerAPIHandlerOptions<{
      body: { members: string[] };
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>>;

  createChat: (
    options: ControllerAPIHandlerOptions<{
      body: ChatCreationRequestDto;
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatCreationResponseDto>>;

  deleteChat: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<boolean>>;

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

  leaveChat: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatGetResponseDto | null>>;

  removeMember: (
    options: ControllerAPIHandlerOptions<{
      params: { id: string; memberId: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>>;

  updateChat: (
    options: ControllerAPIHandlerOptions<{
      body: ChatUpdateRequestDto;
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<ChatUpdateResponseDto>>;

  updateLastViewedTime: (
    options: ControllerAPIHandlerOptions<{
      body: { lastViewedTime: string };
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UpdateLastViewedTimeResponseDto>>;
};

export { type ChatController };
