import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { MessageStatus, MessageType } from '@team-link/shared';

import {
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import {
  type MessageCreationResponseDto,
  type MessageHistoryItem
} from '../libs/types/types.js';
import {
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
} from './actions.js';

const optimisticMessageId = (clientMessageId: string): string =>
  `optimistic:${clientMessageId}`;

type WritableMessageState = {
  messages: MessageHistoryItem[];
  writeDataStatus: ValueOf<typeof DataStatus>;
};

const replaceOptimisticWithPayload = (
  state: WritableMessageState,
  clientMessageId: string,
  payload: MessageCreationResponseDto
): void => {
  const optimisticId = optimisticMessageId(clientMessageId);
  const index = state.messages.findIndex(
    message => message.id === optimisticId
  );
  const previous = index >= ZERO_VALUE ? state.messages[index] : undefined;

  if (previous?.fileUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(previous.fileUrl);
  }

  if (index >= ZERO_VALUE) {
    state.messages[index] = payload;
  } else {
    state.messages.push(payload);
  }

  state.writeDataStatus = DataStatus.FULFILLED;
};

const removeOptimisticMessage = (
  state: WritableMessageState,
  clientMessageId: string
): void => {
  const optimisticId = optimisticMessageId(clientMessageId);
  const previous = state.messages.find(message => message.id === optimisticId);

  if (previous?.fileUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(previous.fileUrl);
  }

  state.messages = state.messages.filter(
    message => message.id !== optimisticId
  );

  state.writeDataStatus = DataStatus.REJECTED;
};

type State = {
  activeHistoryChatId: null | string;
  addDataStatus: ValueOf<typeof DataStatus>;
  dataStatus: ValueOf<typeof DataStatus>;
  editDataStatus: ValueOf<typeof DataStatus>;
  fileBlob: null | { blob: Blob; id: string };
  isAfter: boolean;
  isBefore: boolean;
  isTranscribedFirst: boolean;
  lastViewedTime: null | string;
  loadDataStatus: ValueOf<typeof DataStatus>;
  messages: MessageHistoryItem[];
  pinnedDataStatus: ValueOf<typeof DataStatus>;
  pinnedMessages: MessageHistoryItem[];
  writeDataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
  activeHistoryChatId: null,
  addDataStatus: DataStatus.IDLE,
  dataStatus: DataStatus.IDLE,
  editDataStatus: DataStatus.IDLE,
  fileBlob: null,
  isAfter: true,
  isBefore: true,
  isTranscribedFirst: false,
  lastViewedTime: null,
  loadDataStatus: DataStatus.IDLE,
  messages: [],
  pinnedDataStatus: DataStatus.IDLE,
  pinnedMessages: [],
  writeDataStatus: DataStatus.IDLE
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getMessages.pending), (state, action) => {
        state.activeHistoryChatId = action.meta.arg.chatId;
        state.messages = [];
        state.lastViewedTime = null;
        state.isAfter = true;
        state.isBefore = true;
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getMessages.fulfilled), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          return;
        }

        state.messages = action.payload.messages;

        if (action.payload.lastViewedTime) {
          state.lastViewedTime = action.payload.lastViewedTime;
        }

        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getMessages.rejected), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          return;
        }

        state.messages = [];
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(loadAfterMessages.fulfilled), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          return;
        }

        if (action.payload.messages.length === ZERO_VALUE) {
          state.isAfter = false;
        }

        state.messages.push(...action.payload.messages);
        state.loadDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(loadAfterMessages.pending), state => {
        state.loadDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(loadAfterMessages.rejected), state => {
        state.loadDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.fulfilled), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          return;
        }

        if (action.payload.messages.length === ZERO_VALUE) {
          state.isBefore = false;
        }

        state.messages.unshift(...action.payload.messages);
        state.loadDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.pending), state => {
        state.loadDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.rejected), state => {
        state.loadDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.fulfilled), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          state.pinnedDataStatus = DataStatus.IDLE;

          return;
        }

        state.pinnedMessages = action.payload.messages;
        state.pinnedDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.rejected), (state, action) => {
        if (
          state.activeHistoryChatId !== null &&
          action.meta.arg.chatId !== state.activeHistoryChatId
        ) {
          state.pinnedDataStatus = DataStatus.IDLE;

          return;
        }

        state.pinnedMessages = [];
        state.pinnedDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.pending), state => {
        state.pinnedMessages = [];
        state.pinnedDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeTextMessage.fulfilled), (state, action) => {
        replaceOptimisticWithPayload(
          state,
          action.meta.arg.clientMessageId,
          action.payload
        );
      })
      .addMatcher(isAnyOf(writeTextMessage.pending), (state, action) => {
        const now = new Date().toISOString();

        state.messages.push({
          chatId: action.meta.arg.chatId,
          content: action.meta.arg.content.content,
          createdAt: now,
          id: optimisticMessageId(action.meta.arg.clientMessageId),
          isPinned: false,
          sender: action.meta.arg.sender,
          status: MessageStatus.SENT,
          type: MessageType.TEXT,
          updatedAt: now
        });
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeTextMessage.rejected), (state, action) => {
        removeOptimisticMessage(state, action.meta.arg.clientMessageId);
      })
      .addMatcher(isAnyOf(writeImageMessage.fulfilled), (state, action) => {
        replaceOptimisticWithPayload(
          state,
          action.meta.arg.clientMessageId,
          action.payload
        );
      })
      .addMatcher(isAnyOf(writeImageMessage.pending), (state, action) => {
        const now = new Date().toISOString();
        const fileUrl = URL.createObjectURL(action.meta.arg.payload.file);

        state.messages.push({
          chatId: action.meta.arg.chatId,
          content: '',
          createdAt: now,
          fileUrl,
          id: optimisticMessageId(action.meta.arg.clientMessageId),
          isPinned: false,
          sender: action.meta.arg.sender,
          status: MessageStatus.SENT,
          type: MessageType.IMAGE,
          updatedAt: now
        });
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeImageMessage.rejected), (state, action) => {
        removeOptimisticMessage(state, action.meta.arg.clientMessageId);
      })
      .addMatcher(isAnyOf(writeVideoMessage.fulfilled), (state, action) => {
        replaceOptimisticWithPayload(
          state,
          action.meta.arg.clientMessageId,
          action.payload
        );
      })
      .addMatcher(isAnyOf(writeVideoMessage.pending), (state, action) => {
        const now = new Date().toISOString();
        const fileUrl = URL.createObjectURL(action.meta.arg.payload.file);

        state.messages.push({
          chatId: action.meta.arg.chatId,
          content: '',
          createdAt: now,
          fileUrl,
          id: optimisticMessageId(action.meta.arg.clientMessageId),
          isPinned: false,
          sender: action.meta.arg.sender,
          status: MessageStatus.SENT,
          type: MessageType.VIDEO,
          updatedAt: now
        });
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeVideoMessage.rejected), (state, action) => {
        removeOptimisticMessage(state, action.meta.arg.clientMessageId);
      })
      .addMatcher(isAnyOf(writeFileMessage.fulfilled), (state, action) => {
        replaceOptimisticWithPayload(
          state,
          action.meta.arg.clientMessageId,
          action.payload
        );
      })
      .addMatcher(isAnyOf(writeFileMessage.pending), (state, action) => {
        const now = new Date().toISOString();
        const { file } = action.meta.arg.payload;

        state.messages.push({
          chatId: action.meta.arg.chatId,
          content: file.name,
          createdAt: now,
          id: optimisticMessageId(action.meta.arg.clientMessageId),
          isPinned: false,
          sender: action.meta.arg.sender,
          status: MessageStatus.SENT,
          type: MessageType.FILE,
          updatedAt: now
        });
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeFileMessage.rejected), (state, action) => {
        removeOptimisticMessage(state, action.meta.arg.clientMessageId);
      })
      .addMatcher(isAnyOf(writeAudioMessage.fulfilled), (state, action) => {
        replaceOptimisticWithPayload(
          state,
          action.meta.arg.clientMessageId,
          action.payload
        );
      })
      .addMatcher(isAnyOf(writeAudioMessage.pending), (state, action) => {
        const now = new Date().toISOString();
        const fileUrl = URL.createObjectURL(action.meta.arg.payload.file);

        state.messages.push({
          chatId: action.meta.arg.chatId,
          content: '',
          createdAt: now,
          fileUrl,
          id: optimisticMessageId(action.meta.arg.clientMessageId),
          isPinned: false,
          sender: action.meta.arg.sender,
          status: MessageStatus.SENT,
          type: MessageType.AUDIO,
          updatedAt: now
        });
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeAudioMessage.rejected), (state, action) => {
        removeOptimisticMessage(state, action.meta.arg.clientMessageId);
      })
      .addMatcher(isAnyOf(deleteMessage.fulfilled), (state, action) => {
        if (action.payload) {
          state.messages = state.messages.filter(
            message => message.id !== action.payload
          );
          state.editDataStatus = DataStatus.FULFILLED;
        }
      })
      .addMatcher(isAnyOf(deleteMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(updateTextMessage.fulfilled), (state, action) => {
        const index = state.messages.findIndex(
          message => message.id === action.payload.id
        );

        if (index !== MINUS_ONE_VALUE) {
          state.messages[index] = action.payload;
          state.editDataStatus = DataStatus.FULFILLED;
        }
      })
      .addMatcher(isAnyOf(updateTextMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(updatePinMessage.fulfilled), (state, action) => {
        const index = state.messages.findIndex(
          message => message.id === action.payload
        );
        const message = state.messages[index];

        if (index !== MINUS_ONE_VALUE && message) {
          const isPinned = !message.isPinned;
          state.messages[index] = {
            ...message,
            isPinned
          };

          if (isPinned) {
            const insertIndex = state.pinnedMessages.findIndex(
              pinnedMessage =>
                new Date(pinnedMessage.createdAt) > new Date(message.createdAt)
            );

            if (insertIndex === MINUS_ONE_VALUE) {
              state.pinnedMessages.push(message);
            } else {
              state.pinnedMessages.splice(insertIndex, ZERO_VALUE, message);
            }
          } else {
            state.pinnedMessages = state.pinnedMessages.filter(
              pinnedMessage => pinnedMessage.id !== action.payload
            );
          }

          state.editDataStatus = DataStatus.FULFILLED;
        }
      })
      .addMatcher(isAnyOf(updatePinMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(downloadFile.fulfilled), (state, action) => {
        state.fileBlob = action.payload;
        state.editDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(downloadFile.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(translateMessage.fulfilled), (state, action) => {
        const index = state.messages.findIndex(
          message => message.id === action.payload.messageId
        );

        const message = state.messages[index];

        if (index !== MINUS_ONE_VALUE && message) {
          state.messages[index] = {
            ...message,
            translatedMessage: action.payload.translatedMessage
          };
          state.editDataStatus = DataStatus.FULFILLED;
        }
      })
      .addMatcher(isAnyOf(translateMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(transcribeMessage.fulfilled), (state, action) => {
        const index = state.messages.findIndex(
          message => message.id === action.payload.id
        );

        if (index !== MINUS_ONE_VALUE) {
          state.messages[index] = action.payload;
          state.editDataStatus = DataStatus.FULFILLED;
        }

        state.isTranscribedFirst =
          index === state.messages.length - ONE_VALUE ? true : false;
      })
      .addMatcher(isAnyOf(transcribeMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'messages',
  reducers: {
    addMessage: (state, action: PayloadAction<MessageCreationResponseDto>) => {
      if (
        state.addDataStatus === DataStatus.IDLE &&
        state.messages[ZERO_VALUE] &&
        state.messages[ZERO_VALUE].chatId === action.payload.chatId
      ) {
        const isDuplicate = state.messages.some(
          message =>
            message.id === action.payload.id &&
            message.chatId === action.payload.chatId
        );

        if (!isDuplicate) {
          state.messages.push(action.payload);
          state.addDataStatus = DataStatus.FULFILLED;
        }
      }
    },
    resetAddDataStatus: state => {
      state.addDataStatus = DataStatus.IDLE;
    },
    resetBeforeAfter: state => {
      state.isAfter = true;
      state.isBefore = true;
    },
    resetEditDataStatus: state => {
      state.editDataStatus = DataStatus.IDLE;
    },
    resetFileBlob: state => {
      state.fileBlob = null;
    },
    resetLoadDataStatus: state => {
      state.loadDataStatus = DataStatus.IDLE;
    },
    resetMessages: state => {
      Object.assign(state, initialState);
    },
    resetWriteDataStatus: state => {
      state.writeDataStatus = DataStatus.IDLE;
    },
    toOriginalMessage: (
      state,
      action: PayloadAction<{ messageId: string }>
    ) => {
      const { messageId } = action.payload;

      const messageIndex = state.messages.findIndex(
        message => message.id === messageId
      );

      if (messageIndex >= ZERO_VALUE) {
        const message = state.messages[messageIndex];

        if (message?.translatedMessage) {
          const { translatedMessage, ...updateMessage } = message;

          state.messages[messageIndex] = updateMessage;
        }
      }
    }
  }
});

export { actions, reducer };
