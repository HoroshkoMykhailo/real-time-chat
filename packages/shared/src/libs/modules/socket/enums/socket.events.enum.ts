const SocketEvents = {
  CALL_ENDED: 'call_ended',
  CALL_INITIATED: 'call_initiated',
  CALL_JOIN: 'call_join',
  CALL_LEAVE: 'call_leave',
  CALL_STATE: 'call_state',
  CALL_USER_JOINED: 'call_user_joined',
  CALL_USER_LEFT: 'call_user_left',
  CHAT_CREATED: 'chat_created',
  CHAT_DELETED: 'chat_deleted',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  MESSAGE: 'message',
  REGISTER_USER: 'register_user',
  WEBRTC_SIGNAL: 'webrtc_signal'
} as const;

export { SocketEvents };
