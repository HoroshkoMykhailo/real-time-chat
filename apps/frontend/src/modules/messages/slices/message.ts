import {
  deleteMessage,
  downloadFile,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeImageMessage,
  writeTextMessage,
  writeVideoMessage
} from './actions.js';
import { actions } from './message.slice.js';

const allActions = {
  ...actions,
  deleteMessage,
  downloadFile,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeImageMessage,
  writeTextMessage,
  writeVideoMessage
};

export { allActions as actions };
export { reducer } from './message.slice.js';
