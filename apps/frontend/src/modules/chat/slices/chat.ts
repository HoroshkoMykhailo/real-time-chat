import {
  createGroup,
  createPrivateChat,
  getChat,
  getMyChats,
  leaveChat
} from './actions.js';
import { actions } from './chat.slice.js';

const allActions = {
  ...actions,
  createGroup,
  createPrivateChat,
  getChat,
  getMyChats,
  leaveChat
};

export { allActions as actions };
export { reducer } from './chat.slice.js';
