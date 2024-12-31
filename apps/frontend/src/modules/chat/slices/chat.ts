import { getMyChats } from './actions.js';
import { actions } from './chat.slice.js';

const allActions = {
  ...actions,
  getMyChats
};

export { allActions as actions };
export { reducer } from './chat.slice.js';
