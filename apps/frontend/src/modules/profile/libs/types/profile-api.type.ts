import {
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto
} from './types.js';

type ProfileApi = {
  getMyProfile(): Promise<UserProfileCreationResponseDto>;

  updateMyProfile(
    payload: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto>;

  updateOtherProfile(
    id: string,
    payload: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto>;
};

export { type ProfileApi };
