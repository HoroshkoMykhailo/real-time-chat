import { ENV } from '~/libs/enums/enums.js';
import { httpApi } from '~/modules/http/http.js';

import { AdminApi } from './admin-api.js';

const adminApi = new AdminApi({
  apiPath: ENV.API_PATH,
  httpApi
});

export { adminApi };
export {
  type AdminUserDetail,
  type AdminUserSummary
} from './libs/types/types.js';
