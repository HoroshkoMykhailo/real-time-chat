import { getUsersByUsername } from './actions.js';
import { actions } from './user.slice.js';

const allActions = {
  ...actions,
  getUsersByUsername
};

export { allActions as actions };
export { reducer } from './user.slice.js';
