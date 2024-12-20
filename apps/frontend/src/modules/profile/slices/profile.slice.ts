import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type UserProfileCreationResponseDto } from '../libs/types/types.js';
import { getProfile, updateOtherProfile, updateProfile } from './actions.js';

type State = {
  dataStatus: ValueOf<typeof DataStatus>;
  profile: UserProfileCreationResponseDto | null;
};

const initialState: State = {
  dataStatus: DataStatus.IDLE,
  profile: null
};

const { actions, reducer } = createSlice({
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(getProfile.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(getProfile.fulfilled), (state, action) => {
        state.profile = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(getProfile.rejected), state => {
        state.profile = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(updateProfile.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(updateProfile.fulfilled), (state, action) => {
        state.profile = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(updateProfile.rejected), state => {
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(updateOtherProfile.pending), state => {
        state.dataStatus = DataStatus.PENDING;
      })
      .addMatcher(isAnyOf(updateOtherProfile.fulfilled), (state, action) => {
        state.profile = action.payload;
        state.dataStatus = DataStatus.FULFILLED;
      })
      .addMatcher(isAnyOf(updateOtherProfile.rejected), state => {
        state.dataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'profile',
  reducers: {}
});

export { actions, reducer };
