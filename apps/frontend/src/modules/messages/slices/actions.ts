import { createAsyncThunk } from '@reduxjs/toolkit';

import { NotificationMessage } from '~/libs/enums/enums.js';
import { type AsyncThunkConfig, type ValueOf } from '~/libs/types/types.js';

import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from '../libs/types/types.js';
import { type MessageLanguage } from '../message.js';
import { ActionType } from './common.js';

const getMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { chatId: string },
  AsyncThunkConfig
>(ActionType.GET_MESSAGES, async ({ chatId }, { extra: { messageApi } }) => {
  return await messageApi.getMessages(chatId);
});

const getPinnedMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { chatId: string },
  AsyncThunkConfig
>(
  ActionType.GET_PINNED_MESSAGES,
  async ({ chatId }, { extra: { messageApi } }) => {
    return await messageApi.getPinnedMessages(chatId);
  }
);

const loadAfterMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { afterTime: string; chatId: string },
  AsyncThunkConfig
>(
  ActionType.LOAD_AFTER_MESSAGES,
  async ({ afterTime, chatId }, { extra: { messageApi } }) => {
    return await messageApi.loadAfterMessages(chatId, afterTime);
  }
);

const loadBeforeMessages = createAsyncThunk<
  GetMessagesResponseDto,
  { beforeTime: string; chatId: string },
  AsyncThunkConfig
>(
  ActionType.LOAD_BEFORE_MESSAGES,
  async ({ beforeTime, chatId }, { extra: { messageApi } }) => {
    return await messageApi.loadBeforeMessages(chatId, beforeTime);
  }
);

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

const writeVideoMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { chatId: string; payload: FileMessageRequestDto },
  AsyncThunkConfig
>(
  ActionType.WRITE_VIDEO_MESSAGE,
  async ({ chatId, payload }, { extra: { messageApi } }) => {
    return await messageApi.writeVideoMessage(chatId, payload);
  }
);

const writeAudioMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { chatId: string; payload: FileMessageRequestDto },
  AsyncThunkConfig
>(
  ActionType.WRITE_AUDIO_MESSAGE,
  async ({ chatId, payload }, { extra: { messageApi } }) => {
    return await messageApi.writeAudioMessage(chatId, payload);
  }
);

const translateMessage = createAsyncThunk<
  TranslateMessageResponseDto,
  { language: ValueOf<typeof MessageLanguage>; messageId: string },
  AsyncThunkConfig
>(
  ActionType.TRANSLATE_MESSAGE,
  async ({ language, messageId }, { extra: { messageApi, toastNotifier } }) => {
    const message = await messageApi.translateMessage(messageId, language);

    toastNotifier.showSuccess(NotificationMessage.MESSAGE_TRANSLATED);

    return message;
  }
);

const transcribeMessage = createAsyncThunk<
  MessageCreationResponseDto,
  { messageId: string },
  AsyncThunkConfig
>(
  ActionType.TRANSCRIBE_MESSAGE,
  async ({ messageId }, { extra: { messageApi, toastNotifier } }) => {
    const message = await messageApi.transcribeMessage(messageId);

    toastNotifier.showSuccess(NotificationMessage.MESSAGE_TRANSCRIBED);

    return message;
  }
);

const downloadFile = createAsyncThunk<
  { blob: Blob; id: string },
  { messageId: string },
  AsyncThunkConfig
>(
  ActionType.DOWNLOAD_FILE,
  async ({ messageId }, { extra: { messageApi } }) => {
    const blob = await messageApi.downloadFile(messageId);

    return { blob, id: messageId };
  }
);

export {
  deleteMessage,
  downloadFile,
  getMessages,
  getPinnedMessages,
  loadAfterMessages,
  loadBeforeMessages,
  transcribeMessage,
  translateMessage,
  updatePinMessage,
  updateTextMessage,
  writeAudioMessage,
  writeFileMessage,
  writeImageMessage,
  writeTextMessage,
  writeVideoMessage
};
