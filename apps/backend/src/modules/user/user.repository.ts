import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type User as TUser, type UserRepository } from './libs/types/types.js';
import { type UserDocument, type UserModel } from './user.model.js';

type Constructor = Record<'userModel', typeof UserModel>;

class User
  extends AbstractRepository<UserDocument, TUser>
  implements UserRepository
{
  public constructor({ userModel }: Constructor) {
    super(userModel);
  }

  public async getByEmail(email: string): Promise<TUser | null> {

    const user = await this.model.findOne({ email }).exec();

    return user ? this.mapToBusinessLogic(user) : null;
  }

  protected mapAdditionalBusinessLogic(document: UserDocument): Partial<TUser> {
    return {
      email: document.email,
    };
  }

  protected mapToDatabase(data: Partial<TUser>): Partial<UserDocument> {
    return {
      email: data.email ?? '',
    };
  }
}

export { User };
