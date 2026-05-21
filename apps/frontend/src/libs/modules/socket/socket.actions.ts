import { StorageKey } from '~/libs/enums/enums.js';
import { storageApi } from '~/modules/storage/storage.js';

import { SocketEvents } from './libs/enums/enums.js';
import { socket } from './socket.js';

const joinChat = (chatId: string): void => {
  socket.emit(SocketEvents.JOIN_CHAT, chatId);
};

const leaveChatRoom = (chatId: string): void => {
  socket.emit(SocketEvents.LEAVE_CHAT, chatId);
};

const registerSocketUserSession = (): void => {
  const token = storageApi.get(StorageKey.TOKEN);

  if (token) {
    socket.emit(SocketEvents.REGISTER_USER, token);
  }
};

export { joinChat, leaveChatRoom, registerSocketUserSession };
