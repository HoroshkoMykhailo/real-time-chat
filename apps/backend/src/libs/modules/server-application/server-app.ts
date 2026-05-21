import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyServerOptions
} from 'fastify';
import { type FastifyValidationResult } from 'fastify/types/schema.js';
import { type Server, Server as SocketIoServer } from 'socket.io';

import { ServerErrorType } from '~/libs/enums/enums.js';
import { type ValidationError } from '~/libs/exceptions/exceptions.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { staticPath } from '~/libs/modules/constants/constants.js';
import { joinPath } from '~/libs/modules/path/path.js';
import { authorization } from '~/libs/modules/plugins/authorization/authorization.plugin.js';
import { type Token } from '~/libs/modules/token/token.js';
import { type ValidationSchema, type WhiteRoute } from '~/libs/types/types.js';
import { type UserService } from '~/modules/user/user.js';

import { type DatabaseModule } from '../database/database.js';
import { HTTPCode } from '../http/http.js';
import { type LoggerModule } from '../logger/logger.js';
import { socketManager, SocketModule } from '../socket/socket.js';
import { getErrorInfo } from './libs/helpers/helpers.js';
import { type ServerApi } from './libs/types/types.js';

type Constructor = {
  apis: ServerApi[];
  config: ConfigModule;
  database: DatabaseModule;
  logger: LoggerModule;
  maximumFileSize: number;
  options: FastifyServerOptions;
  services: {
    userService: UserService;
  };
  token: Token;
  whiteRoutes: WhiteRoute[];
};

class ServerApp {
  public get app(): FastifyInstance {
    return this.#app;
  }

  public get database(): DatabaseModule {
    return this.#database;
  }

  public get io(): Server {
    return this.#app.io;
  }

  #apis: ServerApi[];

  #app: FastifyInstance;

  #config: ConfigModule;

  #database: DatabaseModule;

  #logger: LoggerModule;

  #maximumFileSize: number;

  #services: {
    userService: UserService;
  };

  #token: Token;

  #whiteRoutes: WhiteRoute[];

  public constructor({
    apis,
    config,
    database,
    logger,
    maximumFileSize,
    options,
    services,
    token,
    whiteRoutes
  }: Constructor) {
    this.#config = config;
    this.#logger = logger;

    this.#app = this.#initApp(options);

    this.#apis = apis;
    this.#database = database;
    this.#token = token;
    this.#whiteRoutes = whiteRoutes;

    this.#services = services;

    this.#maximumFileSize = maximumFileSize;
  }

  public initialize = async (): Promise<typeof this> => {
    this.#initValidationCompiler();
    await this.#registerServe();
    await this.#initPlugins();
    this.#registerRoutes();
    this.#initErrorHandler();

    await this.#database.connect();

    return this;
  };

  public start = async (): never | Promise<void> => {
    try {
      await this.#app.listen({
        host: this.#config.ENV.APP.HOST,
        port: this.#config.ENV.APP.PORT
      });

      this.#logger.info(
        `Application is listening on PORT - ${this.#config.ENV.APP.PORT.toString()}, on ENVIRONMENT - ${
          this.#config.ENV.APP.ENVIRONMENT as string
        }.`
      );
    } catch (error) {
      if (error instanceof Error) {
        this.#logger.error(error.message, {
          cause: error.cause,
          stack: error.stack
        });
      }

      throw error;
    }
  };

  #initApp = (options: FastifyServerOptions): FastifyInstance => {
    return fastify(options);
  };

  #initErrorHandler(): void {
    this.app.setErrorHandler(
      (error: FastifyError | ValidationError, _request, reply) => {
        const { internalMessage, response, status } = getErrorInfo(error);

        this.#logger.error(internalMessage);

        if (response.errorType === ServerErrorType.VALIDATION) {
          for (const detail of response.details) {
            this.#logger.error(
              `[${detail.path.toString()}] — ${detail.message}`
            );
          }
        }

        return reply.status(status).send(response);
      }
    );
  }

  #initPlugins = async (): Promise<void> => {
    const { userService } = this.#services;

    await this.#app.register(fastifyMultipart, {
      attachFieldsToBody: true,
      limits: {
        fileSize: this.#maximumFileSize
      },
      throwFileSizeLimit: true
    });

    await this.#app.register(authorization, {
      token: this.#token,
      userService,
      whiteRoutes: this.#whiteRoutes
    });

    // fastify-socket.io only declares Fastify 4 peers; attach Socket.IO to the Node HTTP server instead.
    const io = new SocketIoServer(this.#app.server, {
      cors: {
        origin: '*'
      }
    });

    this.#app.decorate('io', io);

    socketManager.setIo(io);

    // SocketModule registers listeners; construction is intentionally side-effecting.
    // eslint-disable-next-line sonarjs/constructor-for-side-effects -- module wiring
    new SocketModule({
      io,
      logger: this.#logger,
      token: this.#token,
      userService
    });
  };

  #initValidationCompiler = (): void => {
    this.app.setValidatorCompiler<ValidationSchema>(({ schema }) => {
      return (data: unknown): ReturnType<FastifyValidationResult> => {
        // Joi's ValidationResult is structurally compatible at runtime; cast for Fastify 5 + exactOptionalPropertyTypes.
        return schema.validate(data, {
          abortEarly: false
        }) as unknown as ReturnType<FastifyValidationResult>;
      };
    });
  };

  #registerRoutes = (): void => {
    const routers = this.#apis.flatMap(it => it.routes);

    for (const it of routers) {
      const { url: path, ...parameters } = it;
      this.#app.route({
        url: joinPath([this.#config.ENV.APP.API_PATH, path]),
        ...parameters
      });
    }
  };

  #registerServe = async (): Promise<void> => {
    await this.#app.register(fastifyStatic, {
      prefix: '/',
      root: staticPath
    });

    this.#app.setNotFoundHandler(async (_request, response) => {
      await response
        .code(HTTPCode.NOT_FOUND)
        .sendFile('index.html', staticPath);
    });
  };
}

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

export { ServerApp };
