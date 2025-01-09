import { getMessages, writeTextMessage } from './actions.js';
import { actions } from './message.slice.js';

const allActions = {
  ...actions,
  getMessages,
  writeTextMessage
};

export { allActions as actions };
export { reducer } from './message.slice.js';
