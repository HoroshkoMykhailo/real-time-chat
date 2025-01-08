import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import { type UserProfileCreationResponseDto } from '../libs/types/types.js';
import { ActionType } from './common.js';

const getUsersByUsername = createAsyncThunk<
  UserProfileCreationResponseDto[],
  string,
  AsyncThunkConfig
>(
  ActionType.GET_USERS_BY_USERNAME,
  async (username, { extra: { userApi } }) => {
    return await userApi.getUsersByUsername(username);
  }
);

export { getUsersByUsername };
