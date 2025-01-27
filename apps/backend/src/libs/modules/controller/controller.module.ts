import { joinPath } from '~/libs/modules/path/path.js';

import { type LoggerModule } from '../logger/logger.js';
import { type ServerApplicationRouteParameters } from '../server-application/server-application.js';
import {
  type ControllerAPIHandler,
  type ControllerAPIHandlerOptions,
  type ControllerModule,
  type ControllerRouteParameters
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  logger: LoggerModule;
};

class Controller implements ControllerModule {
  #apiPath: string;

  #logger: LoggerModule;

  #routes: ServerApplicationRouteParameters[] = [];

  public constructor({ apiPath, logger }: Constructor) {
    this.#logger = logger;
    this.#apiPath = apiPath;
  }

  private async mapHandler(
    handler: ControllerAPIHandler,
    request: Parameters<ServerApplicationRouteParameters['handler']>[0],
    reply: Parameters<ServerApplicationRouteParameters['handler']>[1]
  ): Promise<void> {
    this.#logger.info(`${request.method.toUpperCase()} on ${request.url}`);

    const handlerOptions = this.mapRequest(request);
    const { payload, status } = await handler(handlerOptions);

    return await (payload instanceof Blob
      ? reply
          .status(status)
          .headers({
            'Content-Length': payload.size.toString(),
            'Content-Type': payload.type || 'application/octet-stream'
          })
          .send(Buffer.from(await payload.arrayBuffer()))
      : reply.status(status).send(payload));
  }

  private mapRequest(
    request: Parameters<ControllerRouteParameters['handler']>[0]
  ): ControllerAPIHandlerOptions {
    const { body, params, query, user } = request;

    return {
      body,
      params,
      query,
      user
    };
  }

  public addRoute(options: ControllerRouteParameters): void {
    const { handler, url } = options;
    this.#routes.push({
      ...options,
      handler: (request, reply) => this.mapHandler(handler, request, reply),
      url: joinPath([this.#apiPath, url])
    });
  }

  public get routes(): ServerApplicationRouteParameters[] {
    return this.#routes;
  }
}

export { Controller };
