const ActionType = {
  DELETE_MESSAGE: 'messages/delete-message',
  GET_MESSAGES: 'messages/get-messages',
  UPDATE_PIN_MESSAGE: 'messages/pin-message',
  UPDATE_TEXT_MESSAGE: 'messages/update-text-message',
  WRITE_TEXT_MESSAGE: 'messages/write-text-message'
} as const;

export { ActionType };
