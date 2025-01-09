import { getMessages } from './actions.js';
import { actions } from './message.slice.js';

const allActions = {
  ...actions,
  getMessages
};

export { allActions as actions };
export { reducer } from './message.slice.js';
