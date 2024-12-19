import { type MultipartFile } from '@fastify/multipart';

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
      files: AsyncIterableIterator<MultipartFile>;
      params: {
        id: string;
      };
      user: User;
    }>
  ) => Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>>;
};

export { type UserController };
