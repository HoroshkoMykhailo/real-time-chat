import convict, { type Config as LibraryConfig } from 'convict';
import { config } from 'dotenv';

import { AppEnvironment } from '~/libs/enums/enums.js';

import { type LoggerModule } from '../logger/logger.js';
import {
  type ConfigModule,
  type EnvironmentSchema
} from './libs/types/types.js';

type Constructor = { logger: LoggerModule };

class Config implements ConfigModule {
  #ENV: EnvironmentSchema;
  #logger: LoggerModule;

  public constructor({ logger }: Constructor) {
    config();

    this.#logger = logger;
    this.#envSchema.load({});
    this.#envSchema.validate({
      allowed: 'strict',
      output: (message: string) => {
        this.#logger.info(message);
      }
    });
    this.#ENV = this.#envSchema.getProperties();
  }

  get #envSchema(): LibraryConfig<EnvironmentSchema> {
    return convict<EnvironmentSchema>({
      APP: {
        API_PATH: '/api',
        ENVIRONMENT: {
          default: null,
          doc: 'Application environment',
          env: 'NODE_ENV',
          format: Object.values(AppEnvironment)
        },
        HOST: {
          default: null,
          doc: 'Host for incoming connections',
          env: 'APP_HOST',
          format: String
        },
        PORT: {
          default: null,
          doc: 'Port for incoming connections',
          env: 'APP_PORT',
          format: Number
        }
      },
      DB: {
        MONGO_TEST_URI: {
          default: null,
          doc: 'MongoDB test connection URI',
          env: 'MONGO_TEST_URI',
          format: String
        },
        MONGO_URI: {
          default: null,
          doc: 'MongoDB connection URI',
          env: 'MONGO_URI',
          format: String
        }
      },
      ENCRYPTION: {
        ALGORITHM: {
          default: null,
          doc: 'Data encryption algorithm',
          env: 'ENCRYPTION_ALGORITHM',
          format: String
        },
        SALT_ROUNDS: {
          default: null,
          doc: 'Data encryption salt rounds',
          env: 'ENCRYPTION_SALT_ROUNDS',
          format: Number
        },
        SECRET: {
          default: null,
          doc: 'Data encryption secret',
          env: 'ENCRYPTION_SECRET',
          format: String
        }
      },
      JWT: {
        ALGORITHM: {
          default: null,
          doc: 'JWT encryption algorithm',
          env: 'JWT_ALGORITHM',
          format: String
        },
        EXPIRATION_TIME: {
          default: null,
          doc: 'JWT expiration time',
          env: 'JWT_EXPIRATION_TIME',
          format: String
        },
        SECRET: {
          default: null,
          doc: 'JWT secret',
          env: 'JWT_SECRET',
          format: String
        }
      }
    });
  }

  public get ENV(): EnvironmentSchema {
    return this.#ENV;
  }
}

export { Config };
