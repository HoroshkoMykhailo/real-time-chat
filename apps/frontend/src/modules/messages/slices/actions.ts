import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import {
  type FileMessageRequestDto,
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

const updatePinMessage = createAsyncThunk<
  null | string,
  { messageId: string },
  AsyncThunkConfig
>(
  ActionType.UPDATE_PIN_MESSAGE,
  async ({ messageId }, { extra: { messageApi } }) => {
    const isUpdated = await messageApi.updatePinMessage(messageId);

    if (!isUpdated) {
      return null;
    }

    return messageId;
  }
);

const writeImageMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { chatId: string; payload: FileMessageRequestDto },
  AsyncThunkConfig
>(
  ActionType.WRITE_IMAGE_MESSAGE,
  async ({ chatId, payload }, { extra: { messageApi } }) => {
    return await messageApi.writeImageMessage(chatId, payload);
  }
);

const writeFileMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { chatId: string; payload: FileMessageRequestDto },
  AsyncThunkConfig
>(
  ActionType.WRITE_FILE_MESSAGE,
  async ({ chatId, payload }, { extra: { messageApi } }) => {
    return await messageApi.writeFileMessage(chatId, payload);
  }
);

const downloadFile = createAsyncThunk<
  Blob,
  { messageId: string },
  AsyncThunkConfig
>(
  ActionType.DOWNLOAD_FILE,
  async ({ messageId }, { extra: { messageApi } }) => {
    return await messageApi.downloadFile(messageId);
  }
);

export {
  deleteMessage,
  downloadFile,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeImageMessage,
  writeTextMessage
};
