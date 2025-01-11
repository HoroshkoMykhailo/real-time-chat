const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:id',
  FILE: '/file',
  PIN: '/pin',
  TEXT: '/text'
} as const;

export { MessageApiPath };
