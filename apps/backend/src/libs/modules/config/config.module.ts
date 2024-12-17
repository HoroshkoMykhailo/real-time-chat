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
      }
    });
  }

  public get ENV(): EnvironmentSchema {
    return this.#ENV;
  }
}

export { Config };
