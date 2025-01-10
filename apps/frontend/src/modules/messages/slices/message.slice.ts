import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { MINUS_ONE_VALUE } from '~/libs/common/constants.js';
import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type GetMessagesResponseDto } from '../libs/types/types.js';
import {
  deleteMessage,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeTextMessage
} from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  editDataStatus: ValueOf<typeof DataStatus>;
  messages: GetMessagesResponseDto;
  writeDataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  editDataStatus: DataStatus.IDLE,
  messages: [],
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
      .addMatcher(isAnyOf(writeTextMessage.fulfilled), (state, action) => {
        state.messages.unshift(action.payload);
        state.writeDataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(writeTextMessage.pending), state => {
        state.writeDataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(writeTextMessage.rejected), state => {
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
      });
  },
  initialState,
  name: 'messages',
  reducers: {
    resetEditDataStatus: state => {
      state.editDataStatus = DataStatus.IDLE;
    },
    resetWriteDataStatus: state => {
      state.writeDataStatus = DataStatus.IDLE;
    }
  }
});

export { actions, reducer };
