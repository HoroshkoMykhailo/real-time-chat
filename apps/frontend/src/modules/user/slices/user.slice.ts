import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type UserProfileCreationResponseDto } from '../libs/types/types.js';
import { getUsersByUsername } from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  users: UserProfileCreationResponseDto[];
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  users: []
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getUsersByUsername.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getUsersByUsername.fulfilled), (state, action) => {
        state.users = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getUsersByUsername.rejected), state => {
        state.users = [];
        state.dataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'user',
  reducers: {}
});

export { actions, reducer };
