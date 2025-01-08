const ActionType = {
  CREATE_PRIVATE_CHAT: 'chat/create-private-chat',
  DELETE_GROUP: 'chat/delete-group',
  GET_CHAT: 'chat/get-chat',
  GET_MY_CHATS: 'chat/get-my-chats',
  LEAVE_CHAT: 'chat/leave-chat',
  REMOVE_MEMBER: 'chat/remove-member'
} as const;

export { ActionType };
