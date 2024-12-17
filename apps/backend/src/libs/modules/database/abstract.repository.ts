import { type Model } from 'mongoose';

import { type AbstractDocument, type AbstractModel } from './abstract.document.js';
import { type Repository } from './libs/types/types.js';

class Abstract<T extends AbstractDocument, K extends AbstractModel> implements Repository<K> {
  protected readonly model: Model<T>;

  public constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(data: Omit<K, 'createdAt' | 'id' | 'updatedAt'>): Promise<K> {
    const document = new this.model(data);
    const savedDocument = await document.save();

    return this.mapToBusinessLogic(savedDocument);
  }

  public async deleteById(id: string): Promise<K | null> {
    const document = await this.model.findByIdAndDelete(id);

    return document ? this.mapToBusinessLogic(document) : null;
  }

  public async getAll(): Promise<K[]> {
    const documents = await this.model.find();

    return documents.map((element) => this.mapToBusinessLogic(element));
  }

  public async getById(id: string): Promise<K | null> {
    const document = await this.model.findById(id);

    return document ? this.mapToBusinessLogic(document) : null;
  }

  protected mapAdditionalBusinessLogic(_document: T): Partial<K> {
    return {};
  }

  protected mapToBusinessLogic(document: T): K {
    return {
      createdAt: document.createdAt.toDateString(),
      id: document.id as string,
      updatedAt: document.updatedAt.toDateString(),
      ...this.mapAdditionalBusinessLogic(document),
    } as unknown as K;
  }

  protected mapToDatabase(_data: Partial<K>): Partial<T> {
    throw new Error('Not implemented: mapToDatabase');
  }

  public async updateById(id: string, data: Partial<K>): Promise<K | null> {
    const transformedData = this.mapToDatabase(data);

    const document = await this.model.findByIdAndUpdate(id, transformedData, { new: true });

    return document ? this.mapToBusinessLogic(document) : null;
  }
}

export { Abstract };
