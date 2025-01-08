import {
  addMembers,
  createGroup,
  createPrivateChat,
  deleteGroup,
  getChat,
  getMyChats,
  leaveChat,
  removeMember
} from './actions.js';
import { actions } from './chat.slice.js';

const allActions = {
  ...actions,
  addMembers,
  createGroup,
  createPrivateChat,
  deleteGroup,
  getChat,
  getMyChats,
  leaveChat,
  removeMember
};

export { allActions as actions };
export { reducer } from './chat.slice.js';
