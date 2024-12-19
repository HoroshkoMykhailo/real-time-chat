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
  updateProfile: (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: {
        id: string;
      };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;
};

export { type UserController };
