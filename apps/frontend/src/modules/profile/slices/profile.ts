import { getProfile, updateOtherProfile, updateProfile } from './actions.js';
import { actions } from './profile.slice.js';

const allActions = {
  ...actions,
  getProfile,
  updateOtherProfile,
  updateProfile
};

export { allActions as actions };
export { reducer } from './profile.slice.js';
