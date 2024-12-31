import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import { type ChatsResponseDto } from '../libs/types/types.js';
import { ActionType } from './common.js';

const getMyChats = createAsyncThunk<
  ChatsResponseDto,
  undefined,
  AsyncThunkConfig
>(ActionType.GET_MY_CHATS, async (_payload, { extra: { chatApi } }) => {
  return await chatApi.getMyChats();
});

export { getMyChats };
