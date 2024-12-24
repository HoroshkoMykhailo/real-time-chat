import { ProfileModel } from './profile.model.js';
import { Profile as ProfileRepository } from './profile.repository.js';

const profileRepository = new ProfileRepository({
  profileModel: ProfileModel
});

export { profileRepository };
export { ProfileModel } from './profile.model.js';
