import { AbstractRepository } from '~/libs/modules/database/database.js';

import { UserRole } from './libs/enums/enums.js';
import { type User as TUser, type UserRepository } from './libs/types/types.js';
import { type UserDocument, type UserModel } from './user.model.js';

type Constructor = Record<'userModel', typeof UserModel>;

const NO_UPDATE_FIELDS = 0;

class User
  extends AbstractRepository<UserDocument, TUser>
  implements UserRepository
{
  public constructor({ userModel }: Constructor) {
    super(userModel);
  }

  public async getByEmail(email: string): Promise<null | UserDocument> {
    const user = await this.model.findOne({ email }).exec();

    return user ?? null;
  }

  public async getByGoogleSub(googleSub: string): Promise<null | UserDocument> {
    const user = await this.model.findOne({ googleSub }).exec();

    return user ?? null;
  }

  public async linkGoogleAccount(
    userId: string,
    googleSub: string
  ): Promise<null | UserDocument> {
    const document = await this.model.findByIdAndUpdate(
      userId,
      { $set: { googleSub } },
      { new: true }
    );

    return document ?? null;
  }

  public async updatePartialById(
    id: string,
    patch: Partial<Pick<TUser, 'email' | 'role'>>
  ): Promise<null | TUser> {
    const $set: Partial<UserDocument> = {};

    if (patch.email !== undefined) {
      $set.email = patch.email;
    }

    if (patch.role !== undefined) {
      $set.role = patch.role;
    }

    if (Object.keys($set).length === NO_UPDATE_FIELDS) {
      return await this.getById(id);
    }

    const document = await this.model.findByIdAndUpdate(
      id,
      { $set },
      { new: true }
    );

    return document ? this.mapToBusinessLogic(document) : null;
  }

  protected mapAdditionalBusinessLogic(document: UserDocument): Partial<TUser> {
    return {
      email: document.email,
      profileId: document.profileId.toString(),
      role: document.role
    };
  }

  protected mapToDatabase(data: Partial<TUser>): Partial<UserDocument> {
    return {
      email: data.email ?? '',
      role: data.role ?? UserRole.USER
    };
  }
}

export { User };
