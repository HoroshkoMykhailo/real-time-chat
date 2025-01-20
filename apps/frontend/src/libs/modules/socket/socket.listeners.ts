import { chatActions } from '~/modules/chat/chat.js';
import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

import { type store } from '../store/store.js';
import { SocketEvents } from './libs/enums/enums.js';
import { socket } from './socket.js';

const initializeSocketListeners = (
  dispatch: typeof store.instance.dispatch,
  getState: typeof store.instance.getState
): void => {
  socket.on(SocketEvents.MESSAGE, (message: MessageCreationResponseDto) => {
    const state = getState();

    const profileId = state.profile.profile?.id;

    if (message.sender.id === profileId) {
      return;
    }

    dispatch(messageActions.addMessage(message));
    dispatch(chatActions.addMessage(message));
  });
};

export { initializeSocketListeners };
