import {
  deleteMessage,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeTextMessage
} from './actions.js';
import { actions } from './message.slice.js';

const allActions = {
  ...actions,
  deleteMessage,
  getMessages,
  updatePinMessage,
  updateTextMessage,
  writeFileMessage,
  writeTextMessage
};

export { allActions as actions };
export { reducer } from './message.slice.js';
