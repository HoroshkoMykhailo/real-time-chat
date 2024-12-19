import { AbstractRepository } from '~/libs/modules/database/database.js';

import { type Profile as TProfile } from './libs/types/types.js';
import { type ProfileDocument, type ProfileModel } from './profile.model.js';

type Constructor = Record<'profileModel', typeof ProfileModel>;

class Profile extends AbstractRepository<ProfileDocument, TProfile> {
  public constructor({ profileModel }: Constructor) {
    super(profileModel);
  }
}

export { Profile };
