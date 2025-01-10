const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:id',
  PIN: '/pin',
  TEXT: '/text'
} as const;

export { MessageApiPath };
