import { APIPath, AuthApiPath } from '~/libs/enums/enums.js';
import { getPublicAppOrigin } from '~/libs/helpers/get-public-app-origin.helper.js';

const getGoogleOAuthStartUrl = (): string => {
  const origin = getPublicAppOrigin();
  const apiPath =
    (import.meta.env['VITE_API_PATH'] as string | undefined) ?? '/api/v1';

  return `${origin}${apiPath}${APIPath.AUTH}${AuthApiPath.GOOGLE}`;
};

export { getGoogleOAuthStartUrl };
