import { type PayloadAction, createSlice, isAnyOf } from '@reduxjs/toolkit';

import {
  MINUS_ONE_VALUE,
  ONE_VALUE,
  ZERO_VALUE
} from '~/libs/common/constants.js';
import { DataStatus, StorageKey } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type MessageType } from '~/modules/messages/message.js';
import { storageApi } from '~/modules/storage/storage.js';

import { type Drafts } from '../libs/types/drafts.type.js';
import {
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type Chats,
  type ChatsResponseDto,
  type Draft
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

const sortChats = (chats: Chats): Chats => {
  return chats.sort((a, b) => {
    const aDate = a.draft?.createdAt ?? a.lastMessage?.createdAt ?? null;
    const bDate = b.draft?.createdAt ?? b.lastMessage?.createdAt ?? null;

    if (!aDate && !bDate) {
      return ZERO_VALUE;
    }

    if (!aDate) {
      return ONE_VALUE;
    }

    if (!bDate) {
      return MINUS_ONE_VALUE;
    }

    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
};

type State = {
  chats: Chats;
  createdChat: ChatCreationResponseDto | null;
  dataStatus: ValueOf<typeof DataStatus>;
  selectedChat: (Chats[number] & Partial<ChatGetResponseDto>) | null;
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
        const draftsJson = storageApi.get(StorageKey.DRAFTS);
        const drafts = draftsJson ? (JSON.parse(draftsJson) as Drafts) : {};

        state.chats = sortChats(
          action.payload.map(chat => {
            const draft = drafts[chat.id];

            return {
              ...chat,
              ...(draft && { draft })
            };
          })
        );
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
    deleteDraft: (state, action: PayloadAction<{ chatId: string }>) => {
      const { chatId } = action.payload;
      const draftsJson = storageApi.get(StorageKey.DRAFTS);
      const drafts = draftsJson ? (JSON.parse(draftsJson) as Drafts) : {};

      const updatedDrafts = Object.fromEntries(
        Object.entries(drafts).filter(([key]) => key !== chatId)
      );

      storageApi.set(StorageKey.DRAFTS, JSON.stringify(updatedDrafts));

      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);

      if (chatIndex >= ZERO_VALUE) {
        const chat = state.chats[chatIndex];

        if (chat?.draft) {
          const { draft, ...updatedChat } = chat;

          state.chats.splice(chatIndex, ONE_VALUE);

          const insertIndex = state.chats.findIndex(
            chat => !chat.draft?.createdAt && !chat.lastMessage?.createdAt
          );

          if (insertIndex === MINUS_ONE_VALUE) {
            state.chats.push(updatedChat as ChatsResponseDto[number]);
          } else {
            state.chats.splice(
              insertIndex,
              ZERO_VALUE,
              updatedChat as ChatsResponseDto[number]
            );
          }
        }
      }
    },
    resetCreatedChat: state => {
      state.createdChat = null;
    },
    resetLastMessage(state, action: PayloadAction<{ chatId: string }>) {
      const { chatId } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);

      if (chatIndex >= ZERO_VALUE) {
        const chat = state.chats[chatIndex];

        if (chat?.lastMessage) {
          const { lastMessage, ...updatedChat } = chat;

          state.chats.splice(chatIndex, ONE_VALUE);

          const insertIndex = state.chats.findIndex(
            chat => !chat.draft?.createdAt && !chat.lastMessage?.createdAt
          );

          if (insertIndex === MINUS_ONE_VALUE) {
            state.chats.push(updatedChat as ChatsResponseDto[number]);
          } else {
            state.chats.splice(
              insertIndex,
              ZERO_VALUE,
              updatedChat as ChatsResponseDto[number]
            );
          }
        }
      }
    },
    resetSelectedChat: state => {
      state.selectedChat = null;
    },
    saveDraft: (
      state,
      action: PayloadAction<{ chatId: string; draft: Draft }>
    ) => {
      const draftsJson = storageApi.get(StorageKey.DRAFTS);
      const drafts = draftsJson ? (JSON.parse(draftsJson) as Drafts) : {};

      drafts[action.payload.chatId] = action.payload.draft;

      storageApi.set(StorageKey.DRAFTS, JSON.stringify(drafts));

      const chatIndex = state.chats.findIndex(
        chat => chat.id === action.payload.chatId
      );

      if (chatIndex >= ZERO_VALUE && state.chats[chatIndex]) {
        const chat = state.chats[chatIndex];

        if (chat) {
          state.chats.splice(chatIndex, ONE_VALUE);

          state.chats.unshift({
            ...chat,
            draft: action.payload.draft
          });
        }
      }
    },
    setSelectedChat: (state, action: { payload: State['selectedChat'] }) => {
      const draftsJson = storageApi.get(StorageKey.DRAFTS);
      const drafts = draftsJson ? (JSON.parse(draftsJson) as Drafts) : {};

      if (action.payload) {
        const draft = drafts[action.payload.id];
        state.selectedChat = {
          ...action.payload,
          ...(draft && { draft })
        };
      }
    },
    updateLastMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        message: {
          content: string;
          createdAt: string;
          fileUrl?: string;
          senderName: string;
          type: ValueOf<typeof MessageType>;
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
        const insertIndex = state.chats.findIndex(
          chat =>
            (!chat.lastMessage?.createdAt ||
              new Date(chat.lastMessage.createdAt) <
                new Date(message.createdAt)) &&
            (!chat.draft?.createdAt ||
              new Date(chat.draft.createdAt) < new Date(message.createdAt))
        );

        if (insertIndex === MINUS_ONE_VALUE) {
          state.chats.push(updatedChat as ChatsResponseDto[number]);
        } else {
          state.chats.splice(
            insertIndex,
            ZERO_VALUE,
            updatedChat as ChatsResponseDto[number]
          );
        }
      }
    }
  }
});

export { actions, reducer };
