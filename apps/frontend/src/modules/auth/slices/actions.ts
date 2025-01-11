import { createAsyncThunk } from '@reduxjs/toolkit';

import { StorageKey } from '~/libs/enums/enums.js';
import { type AsyncThunkConfig } from '~/libs/types/types.js';
import {
  type User,
  type UserSignInRequestDto,
  type UserSignUpRequestDto
} from '~/modules/auth/auth.js';

import { ActionType } from './common.js';

const signUp = createAsyncThunk<User, UserSignUpRequestDto, AsyncThunkConfig>(
  ActionType.SIGN_UP,
  async (request, { extra: { authApi, storageApi } }) => {
    const { token, user } = await authApi.signUp(request);
    storageApi.set(StorageKey.TOKEN, token);

    return user;
  }
);

const getAuthenticatedUser = createAsyncThunk<
  User | null,
  undefined,
  AsyncThunkConfig
>(ActionType.GET_USER, async (_payload, { extra: { authApi, storageApi } }) => {
  const token = storageApi.get(StorageKey.TOKEN);

  const hasToken = Boolean(token);

  if (!hasToken) {
    return null;
  }

  return await authApi.getUser();
});

const signIn = createAsyncThunk<User, UserSignInRequestDto, AsyncThunkConfig>(
  ActionType.SIGN_IN,
  async (request, { extra: { authApi, storageApi } }) => {
    const { token, user } = await authApi.signIn(request);
    storageApi.set(StorageKey.TOKEN, token);

    return user;
  }
);

const logout = createAsyncThunk<undefined, undefined, AsyncThunkConfig>(
  ActionType.LOGOUT,
  async (_payload, { extra: { storageApi } }): Promise<undefined> => {
    storageApi.clear();
    await Promise.resolve();
  }
);

export { getAuthenticatedUser, logout, signIn, signUp };
