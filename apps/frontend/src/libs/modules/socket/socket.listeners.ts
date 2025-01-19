import { type MessageCreationResponseDto } from '~/modules/messages/libs/types/types.js';
import { messageActions } from '~/modules/messages/message.js';

import { type store } from '../store/store.js';
import { SocketEvents } from './libs/enums/enums.js';
import { socket } from './socket.js';

const initializeSocketListeners = (
  dispatch: typeof store.instance.dispatch
): void => {
  socket.on(SocketEvents.MESSAGE, (message: MessageCreationResponseDto) => {
    dispatch(messageActions.addMessage(message));
  });
};

export { initializeSocketListeners };
