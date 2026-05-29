import { APIPath, AuthApiPath } from '~/libs/enums/enums.js';

const getGoogleOAuthStartUrl = (): string => {
  const origin = import.meta.env['VITE_APP_PROXY_SERVER_URL'] as string;
  const apiPath = import.meta.env['VITE_API_PATH'] as string;

  return `${origin}${apiPath}${APIPath.AUTH}${AuthApiPath.GOOGLE}`;
};

export { getGoogleOAuthStartUrl };
