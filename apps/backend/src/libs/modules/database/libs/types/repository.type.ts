type Repository<T> = {
  create(_payload: Omit<T, 'createdAt' | 'id' | 'updatedAt'>): Promise<T>;
  deleteById(_id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  getById(_id: string): Promise<T | null>;
  updateById(_id: string, _payload: Partial<T>): Promise<T | null>;
};

export { type Repository };
