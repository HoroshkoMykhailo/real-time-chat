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
  public get ENV(): EnvironmentSchema {
    return this.#ENV;
  }
  #ENV: EnvironmentSchema;

  #logger: LoggerModule;

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
          default: '',
          doc: 'MongoDB test connection URI (unused when NODE_ENV is production)',
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
          default: 'aes-128-ecb',
          doc: 'Data encryption algorithm',
          env: 'ENCRYPTION_ALGORITHM',
          format: String
        },
        SALT_ROUNDS: {
          default: 10,
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
      GOOGLE_CLOUD: {
        PROJECT_ID: {
          default: null,
          doc: 'Google Cloud project ID',
          env: 'GOOGLE_CLOUD_PROJECT_ID',
          format: String
        },
        STORAGE_BUCKET: {
          default: '',
          doc: 'Google Cloud Storage bucket for uploads (images, audio, etc.). Empty = store under backend public folder.',
          env: 'GOOGLE_CLOUD_STORAGE_BUCKET',
          format: String
        },
        SUMMARY_MODEL: {
          default: 'gemini-2.5-flash',
          doc: 'Vertex AI model id for chat summaries (see generative AI model docs)',
          env: 'GOOGLE_CLOUD_SUMMARY_MODEL',
          format: String
        },
        VERTEX_LOCATION: {
          default: 'us-central1',
          doc: 'Vertex AI region',
          env: 'GOOGLE_CLOUD_VERTEX_LOCATION',
          format: String
        }
      },
      GOOGLE_OAUTH: {
        CLIENT_ID: {
          default: '',
          doc: 'Google OAuth 2.0 Web client ID (empty disables Google sign-in redirect flow)',
          env: 'GOOGLE_OAUTH_CLIENT_ID',
          format: String
        },
        CLIENT_SECRET: {
          default: '',
          doc: 'Google OAuth 2.0 client secret (keep server-side only)',
          env: 'GOOGLE_OAUTH_CLIENT_SECRET',
          format: String
        },
        FRONTEND_URL: {
          default: '',
          doc: 'Public SPA origin for post-login redirect (e.g. http://localhost:3000)',
          env: 'GOOGLE_OAUTH_FRONTEND_URL',
          format: String
        },
        REDIRECT_URI: {
          default: '',
          doc: 'Backend OAuth callback URL registered in Google Cloud (e.g. http://localhost:3001/api/v1/auth/google/callback)',
          env: 'GOOGLE_OAUTH_REDIRECT_URI',
          format: String
        }
      },
      JWT: {
        ALGORITHM: {
          default: 'HS256',
          doc: 'JWT encryption algorithm',
          env: 'JWT_ALGORITHM',
          format: String
        },
        EXPIRATION_TIME: {
          default: '24h',
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
}

export { Config };
