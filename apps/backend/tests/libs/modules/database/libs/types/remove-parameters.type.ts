import { type DatabaseCollectionName } from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

type RemoveParameters<T extends Record<string, unknown>> = {
  condition?: T;
  table: ValueOf<typeof DatabaseCollectionName>;
};

export { type RemoveParameters };
