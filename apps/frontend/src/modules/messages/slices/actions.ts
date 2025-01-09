import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import {
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from '../libs/types/types.js';
import { ActionType } from './common.js';

const getMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { chatId: string },
  AsyncThunkConfig
>(ActionType.GET_MESSAGES, async ({ chatId }, { extra: { messageApi } }) => {
  return await messageApi.getMessages(chatId);
});

const writeTextMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { chatId: string; content: TextMessageRequestDto },
  AsyncThunkConfig
>(
  ActionType.WRITE_TEXT_MESSAGE,
  async ({ chatId, content }, { extra: { messageApi } }) => {
    return await messageApi.writeTextMessage(chatId, content);
  }
);

export { getMessages, writeTextMessage };
