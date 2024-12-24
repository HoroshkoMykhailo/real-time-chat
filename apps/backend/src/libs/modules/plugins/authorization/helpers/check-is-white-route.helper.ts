import { type HTTPMethod } from '~/libs/modules/http/http.js';
import { type ValueOf, type WhiteRoute } from '~/libs/types/types.js';

type WhiteRouteOptions = {
  method: ValueOf<typeof HTTPMethod>;
  url: string;
  whiteRoutes: WhiteRoute[];
};

const checkIsWhiteRoute = ({
  method,
  url,
  whiteRoutes
}: WhiteRouteOptions): boolean => {
  const apiUrlRegex = /^\/api\/v\d+(\/.+)$/;
  const match = apiUrlRegex.exec(url);
  const [, route] = match ?? [];

  if (!route) {
    return true;
  }

  return whiteRoutes.some(
    ({ methods, path }) => path === route && methods.includes(method)
  );
};

export { checkIsWhiteRoute };
