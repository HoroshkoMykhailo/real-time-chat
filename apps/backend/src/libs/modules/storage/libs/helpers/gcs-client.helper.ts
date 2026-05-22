import { Storage } from '@google-cloud/storage';

import { config } from '~/libs/modules/config/config.js';

let client: null | Storage = null;

const getGcsClient = (): Storage => {
  client ??= new Storage({
    projectId: config.ENV.GOOGLE_CLOUD.PROJECT_ID
  });

  return client;
};

export { getGcsClient };
