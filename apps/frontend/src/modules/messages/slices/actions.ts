import { createAsyncThunk } from '@reduxjs/toolkit';
import { type Profile } from '@team-link/shared';

import { ONE_VALUE, ZERO_VALUE } from '~/libs/common/constants.js';
import { NotificationMessage } from '~/libs/enums/enums.js';
import {
  type AppDispatch,
  type RootState
} from '~/libs/modules/store/store.js';
import { type AsyncThunkConfig, type ValueOf } from '~/libs/types/types.js';
import { chatActions } from '~/modules/chat/chat.js';
import { type ChatGetResponseDto } from '~/modules/chat/libs/types/types.js';

import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type MessageHistoryItem,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from '../libs/types/types.js';
import { type MessageLanguage } from '../message.js';
import { ActionType } from './common.js';

type LastPinnedMessage = NonNullable<ChatGetResponseDto['lastPinnedMessage']>;

const toLastPinnedMessagePayload = (
  message: MessageHistoryItem
): LastPinnedMessage => ({
  content: message.content,
  createdAt: message.createdAt,
  ...(message.fileUrl && { fileUrl: message.fileUrl }),
  id: message.id,
  senderName: message.sender.username,
  type: message.type
});

const syncChatLastPinnedAfterUnpin = ({
  dispatch,
  remaining
}: {
  dispatch: AppDispatch;
  remaining: MessageHistoryItem[];
}): void => {
  if (remaining.length === ZERO_VALUE) {
    dispatch(chatActions.resetLastPinnedMessage());

    return;
  }

  const initialPinned = remaining[ZERO_VALUE];

  if (initialPinned === undefined) {
    dispatch(chatActions.resetLastPinnedMessage());

    return;
  }

  let latest = initialPinned;

  for (let index = ONE_VALUE; index < remaining.length; index += ONE_VALUE) {
    const current = remaining[index];

    if (current && new Date(current.createdAt) > new Date(latest.createdAt)) {
      latest = current;
    }
  }

  dispatch(
    chatActions.updateLastPinnedMessage({
      message: toLastPinnedMessagePayload(latest)
    })
  );
};

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
  {
    chatId: string;
    clientMessageId: string;
    content: TextMessageRequestDto;
    sender: Profile;
  },
  AsyncThunkConfig
>(
  ActionType.WRITE_TEXT_MESSAGE,
  async (
    { chatId, clientMessageId: _clientMessageId, content, sender: _sender },
    { extra: { messageApi } }
  ) => {
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
  async ({ messageId }, { dispatch, extra: { messageApi }, getState }) => {
    const state = getState() as RootState;
    const fromMessages = state.message.messages.find(
      message => message.id === messageId
    );
    const fromPinned = state.message.pinnedMessages.find(
      message => message.id === messageId
    );
    const message = fromMessages ?? fromPinned;

    const isUpdated = await messageApi.updatePinMessage(messageId);

    if (!isUpdated || !message) {
      return null;
    }

    const nowPinned = !message.isPinned;

    if (nowPinned) {
      dispatch(
        chatActions.updateLastPinnedMessage({
          message: toLastPinnedMessagePayload(message)
        })
      );
    } else {
      const seenIds = new Set<string>();
      const remaining: MessageHistoryItem[] = [];

      for (const item of state.message.messages) {
        if (item.id === messageId || !item.isPinned || seenIds.has(item.id)) {
          continue;
        }

        seenIds.add(item.id);
        remaining.push(item);
      }

      for (const item of state.message.pinnedMessages) {
        if (item.id === messageId || !item.isPinned || seenIds.has(item.id)) {
          continue;
        }

        seenIds.add(item.id);
        remaining.push(item);
      }

      syncChatLastPinnedAfterUnpin({ dispatch, remaining });
    }

    return messageId;
  }
);

const writeImageMessage = createAsyncThunk<
  MessageCreationResponseDto,
  {
    chatId: string;
    clientMessageId: string;
    payload: FileMessageRequestDto;
    sender: Profile;
  },
  AsyncThunkConfig
>(
  ActionType.WRITE_IMAGE_MESSAGE,
  async (
    { chatId, clientMessageId: _clientMessageId, payload, sender: _sender },
    { extra: { messageApi } }
  ) => {
    return await messageApi.writeImageMessage(chatId, payload);
  }
);

const writeFileMessage = createAsyncThunk<
  MessageCreationResponseDto,
  {
    chatId: string;
    clientMessageId: string;
    payload: FileMessageRequestDto;
    sender: Profile;
  },
  AsyncThunkConfig
>(
  ActionType.WRITE_FILE_MESSAGE,
  async (
    { chatId, clientMessageId: _clientMessageId, payload, sender: _sender },
    { extra: { messageApi } }
  ) => {
    return await messageApi.writeFileMessage(chatId, payload);
  }
);

const writeVideoMessage = createAsyncThunk<
  MessageCreationResponseDto,
  {
    chatId: string;
    clientMessageId: string;
    payload: FileMessageRequestDto;
    sender: Profile;
  },
  AsyncThunkConfig
>(
  ActionType.WRITE_VIDEO_MESSAGE,
  async (
    { chatId, clientMessageId: _clientMessageId, payload, sender: _sender },
    { extra: { messageApi } }
  ) => {
    return await messageApi.writeVideoMessage(chatId, payload);
  }
);

const writeAudioMessage = createAsyncThunk<
  MessageCreationResponseDto,
  {
    chatId: string;
    clientMessageId: string;
    payload: FileMessageRequestDto;
    sender: Profile;
  },
  AsyncThunkConfig
>(
  ActionType.WRITE_AUDIO_MESSAGE,
  async (
    { chatId, clientMessageId: _clientMessageId, payload, sender: _sender },
    { extra: { messageApi } }
  ) => {
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
