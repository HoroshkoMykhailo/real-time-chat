import {
  deleteMessage,
  getMessages,
  updateTextMessage,
  writeTextMessage
} from './actions.js';
import { actions } from './message.slice.js';

const allActions = {
  ...actions,
  deleteMessage,
  getMessages,
  updateTextMessage,
  writeTextMessage
};

export { allActions as actions };
export { reducer } from './message.slice.js';
