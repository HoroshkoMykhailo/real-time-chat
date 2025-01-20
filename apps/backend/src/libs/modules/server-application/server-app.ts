import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyPluginAsync,
  type FastifyRegisterOptions,
  type FastifyServerOptions
} from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { type Server, type ServerOptions } from 'socket.io';

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
import { SocketModule, socketManager } from '../socket/socket.js';
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
  #apis: ServerApi[];

  #app: FastifyInstance;

  #config: ConfigModule;

  #database: DatabaseModule;

  #initApp = (options: FastifyServerOptions): FastifyInstance => {
    return fastify(options);
  };

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

    await this.#app.register(
      fastifyIO as unknown as FastifyPluginAsync,
      {
        cors: {
          origin: '*'
        }
      } as FastifySocketIOOptions
    );

    const { io } = this.#app;

    socketManager.setIo(io);

    new SocketModule({ io, logger: this.#logger });
  };

  #initValidationCompiler = (): void => {
    this.app.setValidatorCompiler<ValidationSchema>(({ schema }) => {
      return <T, R = ReturnType<ValidationSchema['validate']>>(data: T): R => {
        return schema.validate(data, {
          abortEarly: false
        }) as R;
      };
    });
  };

  #logger: LoggerModule;

  #maximumFileSize: number;

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

  #services: {
    userService: UserService;
  };

  #token: Token;

  #whiteRoutes: WhiteRoute[];

  public initialize = async (): Promise<typeof this> => {
    this.#initValidationCompiler();
    await this.#registerServe();
    await this.#initPlugins();
    this.#registerRoutes();
    this.#initErrorHandler();

    await this.#database.connect();

    return this;
  };

  public start = async (): Promise<void> | never => {
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

  public get app(): FastifyInstance {
    return this.#app;
  }

  public get database(): DatabaseModule {
    return this.#database;
  }

  public get io(): Server {
    return this.#app.io;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

declare module 'fastify-socket.io' {
  interface SocketIOOptions extends ServerOptions {
    cors?: {
      methods?: string[];
      origin: string | string[];
    };
  }
}

type FastifySocketIOOptions = {
  cors?: {
    methods?: string[];
    origin: string | string[];
  };
} & FastifyRegisterOptions<Record<never, never>>;

export { ServerApp };
