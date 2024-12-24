import { type FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { JWTExpired } from 'jose/errors';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import {
  HTTPCode,
  HTTPError,
  type HTTPMethod
} from '~/libs/modules/http/http.js';
import { type Token } from '~/libs/modules/token/token.js';
import { type ValueOf, type WhiteRoute } from '~/libs/types/types.js';
import { type User as UserService } from '~/modules/user/user.service.js';

import { checkIsWhiteRoute } from './helpers/check-is-white-route.helper.js';

type Options = {
  token: Token;
  userService: UserService;
  whiteRoutes: WhiteRoute[];
};

const authorization = fp<Options>((fastify, options, done) => {
  const { token, userService, whiteRoutes } = options;

  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    if (
      checkIsWhiteRoute({
        method: request.method as ValueOf<typeof HTTPMethod>,
        url: request.url,
        whiteRoutes
      })
    ) {
      return;
    }

    const BEARER_PREFIX = 'Bearer ';
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith(BEARER_PREFIX)) {
      throw new HTTPError({
        message: ExceptionMessage.NO_TOKEN_PROVIDED,
        status: HTTPCode.UNAUTHORIZED
      });
    }

    const jwtToken = authHeader.slice(BEARER_PREFIX.length);

    try {
      const payload = await token.verifyToken(jwtToken);
      const { userId } = payload;

      if (!userId) {
        throw new HTTPError({
          message: ExceptionMessage.INVALID_TOKEN_NO_USER_ID,
          status: HTTPCode.UNAUTHORIZED
        });
      }

      const user = await userService.find(userId as string);
      request.user = user;
    } catch (error) {
      const isTokenExpiredError = error instanceof JWTExpired;

      if (isTokenExpiredError) {
        throw new HTTPError({
          cause: error,
          message: ExceptionMessage.TOKEN_EXPIRED,
          status: HTTPCode.UNAUTHORIZED
        });
      }

      if (error instanceof HTTPError) {
        throw error;
      }

      throw new HTTPError({
        message: ExceptionMessage.INVALID_TOKEN,
        status: HTTPCode.UNAUTHORIZED
      });
    }
  });

  done();
});

export { authorization };
