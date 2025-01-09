import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { ONE_VALUE, ZERO_VALUE } from '~/libs/common/constants.js';
import { DataStatus } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import {
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from '../libs/types/types.js';
import {
  addMembers,
  createGroup,
  createPrivateChat,
  deleteGroup,
  getChat,
  getMyChats,
  leaveChat,
  removeMember,
  updateGroup
} from './actions.js';

type State = {
  chats: ChatsResponseDto;
  createdChat: ChatCreationResponseDto | null;
  dataStatus: ValueOf<typeof DataStatus>;
  selectedChat: (ChatsResponseDto[number] & Partial<ChatGetResponseDto>) | null;
};

const initialState: State = {
  chats: [],
  createdChat: null,
  dataStatus: DataStatus.IDLE,
  selectedChat: null
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
      })
      .addMatcher(isAnyOf(getChat.fulfilled), (state, action) => {
        if (state.selectedChat) {
          state.selectedChat = {
            ...state.selectedChat,
            ...action.payload
          };
        }
      })
      .addMatcher(isAnyOf(getChat.rejected), state => {
        state.selectedChat = null;
      })
      .addMatcher(isAnyOf(leaveChat.fulfilled), (state, action) => {
        state.chats = state.chats.filter(chat => chat.id !== action.payload);
      })
      .addMatcher(isAnyOf(createPrivateChat.fulfilled), (state, action) => {
        state.createdChat = action.payload;
      })
      .addMatcher(isAnyOf(createPrivateChat.rejected), state => {
        state.createdChat = null;
      })
      .addMatcher(isAnyOf(createGroup.fulfilled), (state, action) => {
        state.createdChat = action.payload;
        state.chats = [action.payload, ...state.chats];
      })
      .addMatcher(isAnyOf(createGroup.rejected), state => {
        state.createdChat = null;
      })
      .addMatcher(isAnyOf(removeMember.fulfilled), (state, action) => {
        if (state.selectedChat) {
          state.selectedChat = {
            ...state.selectedChat,
            ...action.payload
          };
        }
      })
      .addMatcher(isAnyOf(removeMember.rejected), state => {
        state.selectedChat = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(deleteGroup.fulfilled), (state, action) => {
        if (action.payload) {
          state.chats = state.chats.filter(chat => chat.id !== action.payload);

          if (state.selectedChat?.id === action.payload) {
            state.selectedChat = null;
          }
        }
      })
      .addMatcher(isAnyOf(deleteGroup.rejected), state => {
        state.selectedChat = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(addMembers.fulfilled), (state, action) => {
        if (state.selectedChat) {
          state.selectedChat = {
            ...state.selectedChat,
            ...action.payload
          };
        }
      })
      .addMatcher(isAnyOf(addMembers.rejected), state => {
        state.selectedChat = null;
        state.dataStatus = DataStatus.REJECTED;
      })
      .addMatcher(isAnyOf(updateGroup.fulfilled), (state, action) => {
        if (state.selectedChat) {
          state.selectedChat = {
            ...state.selectedChat,
            ...action.payload
          };
        }

        state.chats = state.chats.map(chat =>
          chat.id === action.payload.id ? { ...chat, ...action.payload } : chat
        );
      })
      .addMatcher(isAnyOf(updateGroup.rejected), state => {
        state.selectedChat = null;
        state.dataStatus = DataStatus.REJECTED;
      });
  },
  initialState,
  name: 'chats',
  reducers: {
    resetCreatedChat: state => {
      state.createdChat = null;
    },
    resetSelectedChat: state => {
      state.selectedChat = null;
    },
    setSelectedChat: (state, action: { payload: State['selectedChat'] }) => {
      state.selectedChat = action.payload;
    },
    updateLastMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        message: {
          content: string;
          createdAt: string;
          senderName: string;
        };
      }>
    ) {
      const { chatId, message } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);

      if (chatIndex >= ZERO_VALUE && state.chats[chatIndex]) {
        const updatedChat = {
          ...state.chats[chatIndex],
          lastMessage: message
        };

        state.chats.splice(chatIndex, ONE_VALUE);
        state.chats.unshift(updatedChat as ChatsResponseDto[number]);
      }
    }
  }
});

export { actions, reducer };
