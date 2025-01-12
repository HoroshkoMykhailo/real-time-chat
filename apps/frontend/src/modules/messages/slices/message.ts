import {
  deleteMessage,
  downloadFile,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeImageMessage,
  writeTextMessage
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
  writeTextMessage
};

export { allActions as actions };
export { reducer } from './message.slice.js';
