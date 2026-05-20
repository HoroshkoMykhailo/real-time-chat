type Repository<T> = {
  create(_payload: Omit<T, 'createdAt' | 'id' | 'updatedAt'>): Promise<T>;
  deleteById(_id: string): Promise<null | T>;
  getAll(): Promise<T[]>;
  getById(_id: string): Promise<null | T>;
  updateById(_id: string, _payload: Partial<T>): Promise<null | T>;
};

export { type Repository };
