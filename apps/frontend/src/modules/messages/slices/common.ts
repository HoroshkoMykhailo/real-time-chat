const ActionType = {
  DELETE_MESSAGE: 'messages/delete-message',
  DOWNLOAD_FILE: 'messages/download-file',
  GET_MESSAGES: 'messages/get-messages',
  UPDATE_PIN_MESSAGE: 'messages/pin-message',
  UPDATE_TEXT_MESSAGE: 'messages/update-text-message',
  WRITE_FILE_MESSAGE: 'messages/write-file-message',
  WRITE_IMAGE_MESSAGE: 'messages/write-image-message',
  WRITE_TEXT_MESSAGE: 'messages/write-text-message',
  WRITE_VIDEO_MESSAGE: 'messages/write-video-message'
} as const;

export { ActionType };
