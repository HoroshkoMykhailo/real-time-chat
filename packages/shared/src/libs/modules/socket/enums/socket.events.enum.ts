const SocketEvents = {
  CHAT_CREATED: 'chat_created',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  MESSAGE: 'message',
  REGISTER_USER: 'register_user'
} as const;

export { SocketEvents };
