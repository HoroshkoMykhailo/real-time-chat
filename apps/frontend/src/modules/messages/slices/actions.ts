import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import { type GetMessagesResponseDto } from '../libs/types/types.js';
import { ActionType } from './common.js';

const getMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { chatId: string },
  AsyncThunkConfig
>(ActionType.GET_MESSAGES, async ({ chatId }, { extra: { messageApi } }) => {
  return await messageApi.getMessages(chatId);
});

export { getMessages };
