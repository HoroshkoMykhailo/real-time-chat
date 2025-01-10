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

const deleteMessage = createAsyncThunk<
  null | string,
  { messageId: string },
  AsyncThunkConfig
>(
  ActionType.DELETE_MESSAGE,
  async ({ messageId }, { extra: { messageApi } }) => {
    const isDeleted = await messageApi.deleteMessage(messageId);

    if (!isDeleted) {
      return null;
    }

    return messageId;
  }
);

const updateTextMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { content: TextMessageRequestDto; messageId: string },
  AsyncThunkConfig
>(
  ActionType.UPDATE_TEXT_MESSAGE,
  async ({ content, messageId }, { extra: { messageApi } }) => {
    return await messageApi.updateTextMessage(messageId, content);
  }
);

export { deleteMessage, getMessages, updateTextMessage, writeTextMessage };
