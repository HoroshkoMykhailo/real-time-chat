import mongoose from 'mongoose';

import { AppEnvironment } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type ConfigModule } from '../config/config.js';
import { type LoggerModule } from '../logger/logger.js';
import { type DatabaseModule } from './libs/types/types.js';

type Constructor = {
  config: ConfigModule;
  logger: LoggerModule;
};

class Database implements DatabaseModule {
  readonly #config: ConfigModule;
  readonly #logger: LoggerModule;

  public constructor({ config, logger }: Constructor) {
    this.#config = config;
    this.#logger = logger;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = this.environmentConfig;
      await mongoose.connect(mongoUri);

      this.#logger.info('MongoDB connection established successfully');
    } catch {
      this.#logger.error('Failed to connect to MongoDB');
    }
  }

  public get environmentConfig(): string {
    return this.environmentsConfig[this.#config.ENV.APP.ENVIRONMENT];
  }

  public get environmentsConfig(): Record<
    ValueOf<typeof AppEnvironment>,
    string
  > {
    const { MONGO_TEST_URI, MONGO_URI } = this.#config.ENV.DB;

    return {
      [AppEnvironment.DEVELOPMENT]: MONGO_URI,
      [AppEnvironment.PRODUCTION]: MONGO_URI,
      [AppEnvironment.TEST]: MONGO_TEST_URI
    };
  }
}

export { Database };
