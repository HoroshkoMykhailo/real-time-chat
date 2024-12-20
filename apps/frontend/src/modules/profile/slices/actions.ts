import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import {
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto
} from '../libs/types/types.js';
import { ActionType } from './common.js';

const getProfile = createAsyncThunk<
  UserProfileCreationResponseDto,
  undefined,
  AsyncThunkConfig
>(ActionType.GET_PROFILE, async (_payload, { extra: { profileApi } }) => {
  return await profileApi.getMyProfile();
});

const updateProfile = createAsyncThunk<
  UserProfileCreationResponseDto,
  UserProfileCreationRequestDto,
  AsyncThunkConfig
>(ActionType.UPDATE_PROFILE, async (payload, { extra: { profileApi } }) => {
  return await profileApi.updateMyProfile(payload);
});

const updateOtherProfile = createAsyncThunk<
  UserProfileCreationResponseDto,
  { id: string; payload: UserProfileCreationRequestDto },
  AsyncThunkConfig
>(
  ActionType.UPDATE_OTHER_PROFILE,
  async ({ id, payload }, { extra: { profileApi } }) => {
    return await profileApi.updateOtherProfile(id, payload);
  }
);

export { getProfile, updateOtherProfile, updateProfile };
