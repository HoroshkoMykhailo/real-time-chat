const ActionType = {
  ADD_MEMBERS: 'chat/add-members',
  CREATE_GROUP: 'chat/create-group',
  CREATE_PRIVATE_CHAT: 'chat/create-private-chat',
  DELETE_GROUP: 'chat/delete-group',
  GET_CHAT: 'chat/get-chat',
  GET_MY_CHATS: 'chat/get-my-chats',
  LEAVE_CHAT: 'chat/leave-chat',
  REMOVE_MEMBER: 'chat/remove-member',
  UPDATE_GROUP: 'chat/update-group',
  UPDATE_LAST_VIEWED_TIME: 'chat/update-last-viewed-time'
} as const;

export { ActionType };
