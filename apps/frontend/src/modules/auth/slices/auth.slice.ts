import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type User } from '~/modules/auth/auth.js';

import { getAuthenticatedUser, logout, signIn, signUp } from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  user: User | null;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  user: null
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(signUp.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(signUp.fulfilled), (state, action) => {
        state.user = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(signUp.rejected), state => {
        state.user = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(getAuthenticatedUser.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getAuthenticatedUser.fulfilled), (state, action) => {
        state.user = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getAuthenticatedUser.rejected), state => {
        state.user = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(signIn.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(signIn.fulfilled), (state, action) => {
        state.user = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(signIn.rejected), state => {
        state.user = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(logout.fulfilled), state => {
        state.user = null;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(logout.rejected), state => {
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(logout.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      });
  },
  initialState,
  name: 'auth',
  reducers: {}
});

export { actions, reducer };
