import { storageApi } from '~/modules/storage/storage.js';

import { Http as HttpApi } from './http-api.js';

const httpApi = new HttpApi({
  storageApi
});

export { httpApi };
export { ExceptionName } from './libs/enums/enums.js';
export { type HttpApi } from './libs/types/types.js';
