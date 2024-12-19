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
  createProfile: (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: {
        userId: string;
      };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;
};

export { type UserController };
