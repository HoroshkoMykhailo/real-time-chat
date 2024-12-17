import { type Document, Schema } from 'mongoose';

interface AbstractDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const AbstractSchema = new Schema<AbstractDocument>(
  {},
  {
    timestamps: true
  }
);

interface AbstractModel {
  createdAt: string;
  id: string;
  updatedAt: string;
}
export { type AbstractDocument, type AbstractModel, AbstractSchema };
