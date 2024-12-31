import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type ChatsResponseDto } from '../libs/types/types.js';
import { getMyChats } from './actions.js';

type State = {
  chats: ChatsResponseDto;
  dataStatus: ValueOf<typeof DataStatus>;
};

const initialState: State = {
  chats: [],
  dataStatus: DataStatus.IDLE
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getMyChats.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getMyChats.fulfilled), (state, action) => {
        state.chats = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getMyChats.rejected), state => {
        state.chats = [];
        state.dataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'chats',
  reducers: {}
});

export { actions, reducer };
