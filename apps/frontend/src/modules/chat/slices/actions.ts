import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/libs/types/types.js';

import { ChatType } from '../libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from '../libs/types/types.js';
import { ActionType } from './common.js';

const getMyChats = createAsyncThunk<
  ChatsResponseDto,
  undefined,
  AsyncThunkConfig
>(ActionType.GET_MY_CHATS, async (_payload, { extra: { chatApi } }) => {
  return await chatApi.getMyChats();
});

const getChat = createAsyncThunk<
  ChatGetResponseDto,
  { id: string },
  AsyncThunkConfig
>(ActionType.GET_CHAT, async ({ id }, { extra: { chatApi } }) => {
  return await chatApi.getChat(id);
});

const leaveChat = createAsyncThunk<string, { id: string }, AsyncThunkConfig>(
  ActionType.LEAVE_CHAT,
  async ({ id }, { extra: { chatApi } }) => {
    await chatApi.leaveChat(id);

    return id;
  }
);

const createPrivateChat = createAsyncThunk<
  ChatCreationResponseDto,
  {
    otherId: string;
    userId: string;
  },
  AsyncThunkConfig
>(
  ActionType.CREATE_PRIVATE_CHAT,
  async ({ otherId, userId }, { extra: { chatApi } }) => {
    const chat: ChatCreationRequestDto = {
      members: [otherId, userId],
      type: ChatType.PRIVATE
    };

    return await chatApi.createChat(chat);
  }
);

const createGroup = createAsyncThunk<
  ChatCreationResponseDto,
  ChatCreationRequestDto,
  AsyncThunkConfig
>(ActionType.CREATE_PRIVATE_CHAT, async (group, { extra: { chatApi } }) => {
  return await chatApi.createChat(group);
});

export { createGroup, createPrivateChat, getChat, getMyChats, leaveChat };
