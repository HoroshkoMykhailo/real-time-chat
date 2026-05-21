import { chatActions } from '~/modules/chat/chat.js';
import { type ChatCreationResponseDto } from '~/modules/chat/libs/types/types.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

import { type store } from '../store/store.js';
import { SocketEvents } from './libs/enums/enums.js';
import { socket } from './socket.js';

type ChatCreatedSocketPayload = {
  chat: ChatCreationResponseDto;
  createdByProfileId: string;
};

type ChatDeletedSocketPayload = {
  chatId: string;
};

let socketListenersAttached = false;

const initializeSocketListeners = (
  dispatch: typeof store.instance.dispatch,
  getState: typeof store.instance.getState
): void => {
  if (socketListenersAttached) {
    return;
  }

  socketListenersAttached = true;

  socket.on(SocketEvents.MESSAGE, (message: MessageCreationResponseDto) => {
    const state = getState();

    const profileId = state.profile.profile?.id;

    if (message.sender.id === profileId) {
      return;
    }

    dispatch(messageActions.addMessage(message));
    dispatch(chatActions.addMessage(message));
  });

  socket.on(SocketEvents.CHAT_CREATED, (payload: ChatCreatedSocketPayload) => {
    const state = getState();
    const profileId = state.profile.profile?.id;

    if (!profileId) {
      return;
    }

    const { chat } = payload;

    if (chat.members.every(member => member.id !== profileId)) {
      return;
    }

    dispatch(chatActions.mergeRealtimeChat(chat));
  });

  socket.on(SocketEvents.CHAT_DELETED, (payload: ChatDeletedSocketPayload) => {
    dispatch(chatActions.removeChatById(payload.chatId));
  });
};

export { initializeSocketListeners };
