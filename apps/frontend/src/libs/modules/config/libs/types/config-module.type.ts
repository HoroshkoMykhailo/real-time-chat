import { type Configurable } from '@real-time-chat/shared';

import { type EnvironmentSchema } from './environment-schema.type.js';

type ConfigModule = Configurable<EnvironmentSchema>;

export { type ConfigModule };
