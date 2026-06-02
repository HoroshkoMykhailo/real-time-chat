import { SocketManager } from './socket.manager.js';

const socketManager = SocketManager.getInstance();

export { socketManager };
export { SocketEvents } from './libs/enums/enums.js';
export { SocketModule, userRoomId } from './socket.module.js';
