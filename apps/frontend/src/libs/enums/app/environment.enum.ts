import { getPublicAppOrigin } from '~/libs/helpers/get-public-app-origin.helper.js';

const apiPath =
  (import.meta.env['VITE_API_PATH'] as string | undefined) ?? '/api/v1';

const ENV = {
  API_PATH: apiPath,
  SERVER_URL: getPublicAppOrigin()
};

export { ENV };
