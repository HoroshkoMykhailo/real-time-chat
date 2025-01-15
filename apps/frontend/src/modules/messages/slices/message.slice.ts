import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { MINUS_ONE_VALUE, ZERO_VALUE } from '~/libs/common/constants.js';
import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type MessageHistoryItem } from '../libs/types/types.js';
import {
  deleteMessage,
  downloadFile,
  getMessages,
  getPinnedMessages,
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
  dataStatus: ValueOf<typeof DataStatus>;
  editDataStatus: ValueOf<typeof DataStatus>;
  fileBlob: Blob | null;
  loadDataStatus: ValueOf<typeof DataStatus>;
  messages: MessageHistoryItem[];
  pinnedMessages: MessageHistoryItem[];
  writeDataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  editDataStatus: DataStatus.IDLE,
  fileBlob: null,
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
        state.messages = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getMessages.rejected), state => {
        state.messages = [];
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.fulfilled), (state, action) => {
        state.messages.unshift(...action.payload);
        state.loadDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.pending), state => {
        state.loadDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(loadBeforeMessages.rejected), state => {
        state.loadDataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(getPinnedMessages.fulfilled), (state, action) => {
        state.pinnedMessages = action.payload;
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
          state.messages[index] = {
            ...message,
            isPinned: !message.isPinned
          };
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
      })
      .addMatcher(isAnyOf(transcribeMessage.rejected), state => {
        state.editDataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'messages',
  reducers: {
    resetEditDataStatus: state => {
      state.editDataStatus = DataStatus.IDLE;
    },
    resetLoadDataStatus: state => {
      state.loadDataStatus = DataStatus.IDLE;
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
