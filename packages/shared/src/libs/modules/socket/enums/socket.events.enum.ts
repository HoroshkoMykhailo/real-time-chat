const SocketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  MESSAGE: 'message'
} as const;

export { SocketEvents };
