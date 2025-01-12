const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:id',
  FILE: '/file',
  IMAGE: '/image',
  PIN: '/pin',
  TEXT: '/text'
} as const;

export { MessageApiPath };
