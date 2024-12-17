import { type AppEnvironment } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

type DatabaseModule = {
  connect(): Promise<void>;
  environmentConfig: string;
  environmentsConfig: Record<ValueOf<typeof AppEnvironment>, string>;
};

export { type DatabaseModule };
