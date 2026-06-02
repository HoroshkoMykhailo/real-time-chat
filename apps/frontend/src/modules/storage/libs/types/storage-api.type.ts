import { type StorageKey } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

type StorageApi = {
  clear(): void;
  drop(key: ValueOf<typeof StorageKey>, chatId?: string): void;
  get(key: ValueOf<typeof StorageKey>, chatId?: string): null | string;
  has(key: ValueOf<typeof StorageKey>, chatId?: string): boolean;
  set(key: ValueOf<typeof StorageKey>, value: string, chatId?: string): void;
};

export { type StorageApi };
