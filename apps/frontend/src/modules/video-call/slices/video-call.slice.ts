import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type CallParticipantListPayload } from '@team-link/shared';

import { ZERO_VALUE } from '~/libs/common/constants.js';

type VideoCallState = {
  callsByChatId: Record<
    string,
    undefined | { participantProfileIds: string[] }
  >;
  localCallChatId: null | string;
};

const omitChatId = (
  map: Record<string, undefined | { participantProfileIds: string[] }>,
  chatId: string
): Record<string, undefined | { participantProfileIds: string[] }> => {
  return Object.fromEntries(
    Object.entries(map).filter(([key]) => {
      return key !== chatId;
    })
  );
};

const initialState: VideoCallState = {
  callsByChatId: {},
  localCallChatId: null
};

const { actions, reducer } = createSlice({
  initialState,
  name: 'videoCall',
  reducers: {
    callEnded: (state, action: PayloadAction<{ chatId: string }>) => {
      state.callsByChatId = omitChatId(
        state.callsByChatId,
        action.payload.chatId
      );

      if (state.localCallChatId === action.payload.chatId) {
        state.localCallChatId = null;
      }
    },
    setCallParticipants: (
      state,
      action: PayloadAction<CallParticipantListPayload>
    ) => {
      const { chatId, participantProfileIds } = action.payload;

      if (participantProfileIds.length === ZERO_VALUE) {
        state.callsByChatId = omitChatId(state.callsByChatId, chatId);

        if (state.localCallChatId === chatId) {
          state.localCallChatId = null;
        }

        return;
      }

      state.callsByChatId[chatId] = { participantProfileIds };
    },
    setLocalCallChatId: (
      state,
      action: PayloadAction<{ chatId: null | string }>
    ) => {
      state.localCallChatId = action.payload.chatId;
    }
  }
});

export { actions as videoCallActions, reducer as videoCallReducer };
