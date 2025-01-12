const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:id',
  FILE: '/file',
  IMAGE: '/image',
  PIN: '/pin',
  TEXT: '/text',
  VIDEO: '/video'
} as const;

export { MessageApiPath };
