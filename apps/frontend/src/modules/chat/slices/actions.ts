import { createAsyncThunk } from '@reduxjs/toolkit';

import { NotificationMessage } from '~/libs/enums/enums.js';
import { type AsyncThunkConfig } from '~/libs/types/types.js';

import { ChatType } from '../libs/enums/enums.js';
import {
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatUpdateRequestDto,
  type ChatUpdateResponseDto,
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
  async ({ id }, { extra: { chatApi, toastNotifier } }) => {
    await chatApi.leaveChat(id);
    toastNotifier.showSuccess(NotificationMessage.CHAT_LEFT);

    return id;
  }
);

const deleteGroup = createAsyncThunk<
  null | string,
  { id: string },
  AsyncThunkConfig
>(
  ActionType.DELETE_GROUP,
  async ({ id }, { extra: { chatApi, toastNotifier } }) => {
    const isDeleted = await chatApi.deleteChat(id);

    if (!isDeleted) {
      return null;
    }

    toastNotifier.showSuccess(NotificationMessage.GROUP_DELETED);

    return id;
  }
);

const removeMember = createAsyncThunk<
  ChatGetResponseDto,
  { id: string; memberId: string },
  AsyncThunkConfig
>(
  ActionType.REMOVE_MEMBER,
  async ({ id, memberId }, { extra: { chatApi, toastNotifier } }) => {
    const chat = await chatApi.removeMember(id, memberId);

    toastNotifier.showSuccess(NotificationMessage.MEMBER_REMOVED);

    return chat;
  }
);

const addMembers = createAsyncThunk<
  ChatGetResponseDto,
  { id: string; members: string[] },
  AsyncThunkConfig
>(
  ActionType.ADD_MEMBERS,
  async ({ id, members }, { extra: { chatApi, toastNotifier } }) => {
    const chat = await chatApi.addMembers(id, members);

    toastNotifier.showSuccess(NotificationMessage.MEMBERS_ADDED);

    return chat;
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
>(
  ActionType.CREATE_GROUP,
  async (group, { extra: { chatApi, toastNotifier } }) => {
    const createdGroup = await chatApi.createChat(group);

    toastNotifier.showSuccess(NotificationMessage.GROUP_CREATED);

    return createdGroup;
  }
);

const updateGroup = createAsyncThunk<
  ChatUpdateResponseDto,
  { id: string; payload: ChatUpdateRequestDto },
  AsyncThunkConfig
>(
  ActionType.UPDATE_GROUP,
  async ({ id, payload }, { extra: { chatApi, toastNotifier } }) => {
    const group = await chatApi.updateGroup(id, payload);

    toastNotifier.showSuccess(NotificationMessage.GROUP_UPDATED);

    return group;
  }
);

export {
  addMembers,
  createGroup,
  createPrivateChat,
  deleteGroup,
  getChat,
  getMyChats,
  leaveChat,
  removeMember,
  updateGroup
};
