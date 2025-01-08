import {
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';

import {
  type User,
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto
} from './types.js';

type UserController = {
  getMyProfile: (
    options: ControllerAPIHandlerOptions<{
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;

  getUser: (
    options: ControllerAPIHandlerOptions<{
      user: User;
    }>
  ) => ControllerAPIHandlerResponse<User>;

  getUsersByUsername: (
    options: ControllerAPIHandlerOptions<{
      query: {
        username: string;
      };
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto[]>>;

  updateMyProfile: (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;

  updateOtherProfile: (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: { id: string };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;
};

export { type UserController };
