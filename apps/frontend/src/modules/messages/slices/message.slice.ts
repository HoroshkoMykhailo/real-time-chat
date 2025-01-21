import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';

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

type State = {
  addDataStatus: ValueOf<typeof DataStatus>;
  dataStatus: ValueOf<typeof DataStatus>;
  editDataStatus: ValueOf<typeof DataStatus>;
  fileBlob: { blob: Blob; id: string } | null;
  isAfter: boolean;
  isBefore: boolean;
  isTranscribedFirst: boolean;
  lastViewedTime: null | string;
  loadDataStatus: ValueOf<typeof DataStatus>;
  messages: MessageHistoryItem[];
  pinnedMessages: MessageHistoryItem[];
  writeDataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
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
  pinnedMessages: [],
  writeDataStatus: DataStatus.IDLE
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getMessages.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getMessages.fulfilled), (state, action) => {
        state.messages = action.payload.messages;

        if (action.payload.lastViewedTime) {
          state.lastViewedTime = action.payload.lastViewedTime;
        }

        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getMessages.rejected), state => {
        state.messages = [];
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(loadAfterMessages.fulfilled), (state, action) => {
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
        state.pinnedMessages = action.payload.messages;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.rejected), state => {
        state.pinnedMessages = [];
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeTextMessage.fulfilled), (state, action) => {
        state.messages.push(action.payload);

        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeTextMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeTextMessage.rejected), state => {
        state.writeDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(writeImageMessage.fulfilled), (state, action) => {
        state.messages.push(action.payload);
        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeImageMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeImageMessage.rejected), state => {
        state.writeDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(writeVideoMessage.fulfilled), (state, action) => {
        state.messages.push(action.payload);
        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeVideoMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeVideoMessage.rejected), state => {
        state.writeDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(writeFileMessage.fulfilled), (state, action) => {
        state.messages.push(action.payload);
        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeFileMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeFileMessage.rejected), state => {
        state.writeDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(writeAudioMessage.fulfilled), (state, action) => {
        state.messages.push(action.payload);
        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeAudioMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeAudioMessage.rejected), state => {
        state.writeDataStatus = DataStatus.REJECTED;
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
