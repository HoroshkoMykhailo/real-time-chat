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
};

export { type EnvironmentSchema };
