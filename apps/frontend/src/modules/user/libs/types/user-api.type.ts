import { type UserProfileCreationResponseDto } from './types.js';

type UserApi = {
  getUsersByUsername: (
    username: string
  ) => Promise<UserProfileCreationResponseDto[]>;
};

export { type UserApi };
