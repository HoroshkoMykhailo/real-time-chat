import { SocketEvents } from './libs/enums/enums.js';
import { socket } from './socket.js';

const joinChat = (chatId: string): void => {
  socket.emit(SocketEvents.JOIN_CHAT, chatId);
};

const leaveChat = (chatId: string): void => {
  socket.emit(SocketEvents.LEAVE_CHAT, chatId);
};

export { joinChat, leaveChat };
