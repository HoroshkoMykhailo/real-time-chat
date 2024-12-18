import { type ValueOf } from '~/libs/types/types.js';

import { type UserRole } from '../enums/enums.js';

type User = {
  createdAt: string;
  email: string;
  id: string;
  role: ValueOf<typeof UserRole>;
  updatedAt: string;
};

export { type User };
