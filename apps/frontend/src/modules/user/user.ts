import { ENV } from '~/libs/enums/enums.js';
import { httpApi } from '~/modules/http/http.js';

import { User as UserApi } from './user-api.js';

const userApi = new UserApi({
  apiPath: ENV.API_PATH,
  httpApi
});

export { userApi };
export {
  actions as userActions,
  reducer as userReducer
} from './slices/user.js';
