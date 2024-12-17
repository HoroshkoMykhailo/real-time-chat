import { type DatabaseCollectionName } from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

type InsertParameters<T extends Record<string, unknown>> = {
  data: T | T[];
  returning?: string[];
  table: ValueOf<typeof DatabaseCollectionName>;
};

export { type InsertParameters };
