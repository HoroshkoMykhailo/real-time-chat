const ActionType = {
  CREATE_PRIVATE_CHAT: 'chat/create-private-chat',
  GET_CHAT: 'chat/get-chat',
  GET_MY_CHATS: 'chat/get-my-chats',
  LEAVE_CHAT: 'chat/leave-chat'
} as const;

export { ActionType };
