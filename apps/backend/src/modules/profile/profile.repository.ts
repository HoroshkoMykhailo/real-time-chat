import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type Profile as TProfile } from './libs/types/types.js';
import { type ProfileDocument, type ProfileModel } from './profile.model.js';

type Constructor = Record<'profileModel', typeof ProfileModel>;

class Profile extends AbstractRepository<ProfileDocument, TProfile> {
  public constructor({ profileModel }: Constructor) {
    super(profileModel);
  }

  public async getProfilesByIds(ids: string[]): Promise<TProfile[]> {
    return await this.model.find({ _id: { $in: ids } });
  }

  protected mapAdditionalBusinessLogic(
    document: ProfileDocument
  ): Partial<TProfile> {
    let result: Partial<TProfile> = {
      language: document.language,
      username: document.username
    };

    if (document.dateOfBirth) {
      result.dateOfBirth = document.dateOfBirth;
    }

    if (document.description) {
      result.description = document.description;
    }

    if (document.profilePicture) {
      result.profilePicture = document.profilePicture;
    }

    return result;
  }

  protected mapToDatabase(data: Partial<TProfile>): Partial<ProfileDocument> {
    const result: Partial<ProfileDocument> = {};

    if (data.dateOfBirth) {
      result.dateOfBirth = data.dateOfBirth;
    }

    if (data.description) {
      result.description = data.description;
    }

    if (data.language) {
      result.language = data.language;
    }

    if (data.username) {
      result.username = data.username;
    }

    if (data.profilePicture) {
      result.profilePicture = data.profilePicture;
    }

    return result;
  }
}

export { Profile };
