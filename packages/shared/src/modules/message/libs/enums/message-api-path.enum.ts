const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:id',
  AUDIO: '/audio',
  FILE: '/file',
  IMAGE: '/image',
  PIN: '/pin',
  TEXT: '/text',
  TRANSCRIBE: '/transcribe',
  TRANSLATE: '/translate',
  VIDEO: '/video'
} as const;

export { MessageApiPath };
