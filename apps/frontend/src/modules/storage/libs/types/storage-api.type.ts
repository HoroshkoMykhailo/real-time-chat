import { type StorageKey } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

type StorageApi = {
  clear(): void;
  drop(key: ValueOf<typeof StorageKey>, chatId?: string): void;
  get<R = string>(key: ValueOf<typeof StorageKey>, chatId?: string): R | null;
  has(key: ValueOf<typeof StorageKey>, chatId?: string): boolean;
  set(key: ValueOf<typeof StorageKey>, value: string, chatId?: string): void;
};

export { type StorageApi };
