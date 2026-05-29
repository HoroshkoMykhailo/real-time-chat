import { type AppEnvironment } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

type EnvironmentSchema = {
  APP: {
    API_PATH: string;
    ENVIRONMENT: ValueOf<typeof AppEnvironment>;
    HOST: string;
    PORT: number;
  };
  DB: {
    MONGO_TEST_URI: string;
    MONGO_URI: string;
  };
  ENCRYPTION: {
    ALGORITHM: string;
    SALT_ROUNDS: number;
    SECRET: string;
  };
  GOOGLE_CLOUD: {
    PROJECT_ID: string;
    STORAGE_BUCKET: string;
    SUMMARY_MODEL: string;
    VERTEX_LOCATION: string;
  };
  GOOGLE_OAUTH: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    FRONTEND_URL: string;
    REDIRECT_URI: string;
  };
  JWT: {
    ALGORITHM: string;
    EXPIRATION_TIME: string;
    SECRET: string;
  };
};

export { type EnvironmentSchema };
