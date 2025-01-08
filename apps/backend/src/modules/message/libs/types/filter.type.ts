import { type Types } from 'mongoose';

type FilterType = {
  chatId: Types.ObjectId;
  createdAt?: {
    $gt?: Date;
    $lt?: Date;
  };
};

export { type FilterType };
