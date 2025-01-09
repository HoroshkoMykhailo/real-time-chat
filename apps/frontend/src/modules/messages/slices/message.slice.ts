import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type GetMessagesResponseDto } from '../libs/types/types.js';
import { getMessages } from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  messages: GetMessagesResponseDto;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  messages: []
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
      });
  },
  initialState,
  name: 'messages',
  reducers: {
    resetMessages: state => {
      state.messages = [];
      state.dataStatus = DataStatus.IDLE;
    }
  }
});

export { actions, reducer };
