import { AbstractRepository } from '~/libs/modules/database/database.js';

import { DEFAULT_LIMIT } from './libs/constants/constants.js';
import { type Profile as TProfile } from './libs/types/types.js';
import { type ProfileDocument, type ProfileModel } from './profile.model.js';

type Constructor = Record<'profileModel', typeof ProfileModel>;

class Profile extends AbstractRepository<ProfileDocument, TProfile> {
  public constructor({ profileModel }: Constructor) {
    super(profileModel);
  }

  public async getByUsername(username: string): Promise<TProfile[]> {
    const profiles = await this.model
      .find({
        username: { $options: 'i', $regex: username }
      })
      .limit(DEFAULT_LIMIT);

    return profiles.map(profile => this.mapToBusinessLogic(profile));
  }

  public async getProfilesByIds(ids: string[]): Promise<TProfile[]> {
    const profiles = await this.model.find({ _id: { $in: ids } });

    return profiles.map(profile => this.mapToBusinessLogic(profile));
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
