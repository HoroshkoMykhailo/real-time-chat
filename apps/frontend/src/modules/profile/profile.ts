import { ENV } from '~/libs/enums/enums.js';
import { httpApi } from '~/modules/http/http.js';

import { Profile as ProfileApi } from './profile-api.js';

const profileApi = new ProfileApi({
  apiPath: ENV.API_PATH,
  httpApi
});

export { profileApi };
export { UserApiPath, UserPayloadKey } from './libs/enums/enums.js';
export { type Profile } from './libs/types/types.js';
export {
  actions as profileActions,
  reducer as profileReducer
} from './slices/profile.js';
