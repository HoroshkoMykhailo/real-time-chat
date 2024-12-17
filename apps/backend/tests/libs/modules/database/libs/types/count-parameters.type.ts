import { type DatabaseCollectionName } from '~/libs/modules/database/database.js';
import { type ValueOf } from '~/libs/types/types.js';

type CountParameters<
  T extends Record<string, unknown>,
  K extends Record<string, unknown>
> = {
  condition?: Partial<T>;
  conditionNot?: K[];
  joins?: [ValueOf<typeof DatabaseCollectionName>, string, string][];
  table: ValueOf<typeof DatabaseCollectionName>;
};

export { type CountParameters };
