import { type StorageKey } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type StorageApi } from './libs/types/types.js';

type Constructor = {
  storage: globalThis.Storage;
};

class Storage implements StorageApi {
  #storage: globalThis.Storage;

  public constructor({ storage }: Constructor) {
    this.#storage = storage;
  }

  public clear(): void {
    this.#storage.clear();
  }

  public drop(key: ValueOf<typeof StorageKey>): void {
    this.#storage.removeItem(key);
  }

  public get(key: ValueOf<typeof StorageKey>): null | string {
    return this.#storage.getItem(key);
  }

  public has(key: ValueOf<typeof StorageKey>): boolean {
    const value = this.get(key);

    return Boolean(value);
  }

  public set(key: ValueOf<typeof StorageKey>, value: string): void {
    this.#storage.setItem(key, value);
  }
}

export { Storage };
