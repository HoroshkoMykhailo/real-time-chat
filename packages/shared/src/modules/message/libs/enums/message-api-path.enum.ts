const MessageApiPath = {
  $CHAT_ID: '/:chatId',
  $MESSAGE_ID: '/:messageId',
  TEXT: '/text'
} as const;

export { MessageApiPath };
