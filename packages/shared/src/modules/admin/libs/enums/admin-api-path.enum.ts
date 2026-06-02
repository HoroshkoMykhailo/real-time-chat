const AdminApiPath = {
  $CHAT_ID: '/chats/:chatId',
  $CHAT_ID_MESSAGES: '/chats/:chatId/messages',
  $USER_ID: '/users/:userId',
  CHATS: '/chats',
  USERS: '/users'
} as const;

export { AdminApiPath };
