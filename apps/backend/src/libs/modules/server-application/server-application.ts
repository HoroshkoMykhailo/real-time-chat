import { type ParsedQs, parse } from 'qs';

import { config } from '~/libs/modules/config/config.js';
import { database } from '~/libs/modules/database/database.js';
import { authController } from '~/modules/auth/auth.js';
import { userController, userService } from '~/modules/user/user.js';

import { logger } from '../logger/logger.js';
import { token } from '../token/token.js';
import { WHITE_ROUTES } from './libs/constants/constants.js';
import { ServerApp } from './server-app.js';
import { ServerAppApi } from './server-app-api.js';

const serverAppApiV1 = new ServerAppApi({
  routes: [...authController.routes, ...userController.routes],
  version: 'v1'
});

const serverApp = new ServerApp({
  apis: [serverAppApiV1],
  config,
  database,
  logger,
  options: {
    ignoreTrailingSlash: true,
    logger: {
      transport: {
        target: 'pino-pretty'
      }
    },
    querystringParser: (stringToParse: string): ParsedQs => {
      return parse(stringToParse, { comma: true });
    }
  },
  services: {
    userService
  },
  token,
  whiteRoutes: WHITE_ROUTES
});

export { serverApp };
export { type ServerApplicationRouteParameters } from './libs/types/types.js';
export { ServerApp } from './server-app.js';
