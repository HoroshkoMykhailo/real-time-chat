import { randomBytes } from 'node:crypto';

import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import {
  isValidDateOfBirth,
  savePicture
} from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { deleteStoredUserMedia } from '~/libs/modules/storage/storage.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type UserSignUpRequestDto } from '../auth/libs/types/types.js';
import { type Profile as ProfileRepository } from '../profile/profile.repository.js';
import { ProfileLanguage, UserRole } from './libs/enums/enums.js';
import {
  type User as TUser,
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto,
  type UserService
} from './libs/types/types.js';
import { type UserDocument } from './user.model.js';
import { type User as UserRepository } from './user.repository.js';

const GOOGLE_OAUTH_PASSWORD_ENTROPY_BYTES = 48;
const GOOGLE_SUB_USERNAME_SLICE_START = 0;
const GOOGLE_SUB_USERNAME_SUFFIX_LENGTH = 8;

type Constructor = {
  encryption: Encryption;
  profileRepository: ProfileRepository;
  userRepository: UserRepository;
};

class User implements UserService {
  #encryption: Encryption;
  #profileRepository: ProfileRepository;
  #userRepository: UserRepository;

  public constructor({
    encryption,
    profileRepository,
    userRepository
  }: Constructor) {
    this.#userRepository = userRepository;
    this.#profileRepository = profileRepository;
    this.#encryption = encryption;
  }

  public async create(payload: UserSignUpRequestDto): Promise<TUser> {
    const { email, password, username } = payload;

    const existingUser = await this.#userRepository.getByEmail(email);

    if (existingUser) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.CONFLICT
      });
    }

    const { hashedData: hashedPassword } =
      await this.#encryption.hash(password);

    const profile = {
      language: ProfileLanguage.ENGLISH,
      username
    };

    const createdProfile = await this.#profileRepository.create(profile);

    const user = {
      ...payload,
      password: hashedPassword,
      profileId: createdProfile.id,
      role: UserRole.USER
    };

    return await this.#userRepository.create(user);
  }

  public async findOrCreateFromGoogleOAuth(payload: {
    email: string;
    googleSub: string;
    name: string;
  }): Promise<{ isNewGoogleRegistration: boolean; user: TUser }> {
    const { email, googleSub, name } = payload;

    const byGoogle = await this.#userRepository.getByGoogleSub(googleSub);

    if (byGoogle) {
      return { isNewGoogleRegistration: false, user: this.mapUser(byGoogle) };
    }

    const byEmail = await this.#userRepository.getByEmail(email);

    if (byEmail) {
      if (byEmail.googleSub && byEmail.googleSub !== googleSub) {
        throw new HTTPError({
          message: ExceptionMessage.GOOGLE_ACCOUNT_LINKED_TO_ANOTHER_USER,
          status: HTTPCode.CONFLICT
        });
      }

      if (!byEmail.googleSub) {
        const linked = await this.#userRepository.linkGoogleAccount(
          byEmail._id.toString(),
          googleSub
        );

        if (!linked) {
          throw new HTTPError({
            message: ExceptionMessage.USER_NOT_FOUND,
            status: HTTPCode.NOT_FOUND
          });
        }

        return {
          isNewGoogleRegistration: false,
          user: this.mapUser(linked)
        };
      }

      return { isNewGoogleRegistration: false, user: this.mapUser(byEmail) };
    }

    const { hashedData: hashedPassword } = await this.#encryption.hash(
      randomBytes(GOOGLE_OAUTH_PASSWORD_ENTROPY_BYTES).toString('hex')
    );

    const [emailLocal = ''] = email.split('@');

    const usernameBase =
      name
        .trim()
        .replaceAll(/\s+/gu, '_')
        .replaceAll(/[^\dA-Za-z_]/gu, '') ||
      emailLocal.replaceAll(/[^\dA-Za-z_]/gu, '_') ||
      'user';

    const username = `${usernameBase}_${googleSub.slice(
      GOOGLE_SUB_USERNAME_SLICE_START,
      GOOGLE_SUB_USERNAME_SUFFIX_LENGTH
    )}`;

    const profile = {
      language: ProfileLanguage.ENGLISH,
      username
    };

    const createdProfile = await this.#profileRepository.create(profile);

    const user = await this.#userRepository.create({
      email,
      googleSub,
      password: hashedPassword,
      profileId: createdProfile.id,
      role: UserRole.USER
    } as never);

    return { isNewGoogleRegistration: true, user };
  }

  public async find(id: string): Promise<TUser> {
    const user = await this.#userRepository.getById(id);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.USER_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return user;
  }
  public async getByEmail(email: string): Promise<UserDocument> {
    const user = await this.#userRepository.getByEmail(email);

    if (!user) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_CREDENTIALS,
        status: HTTPCode.NOT_FOUND
      });
    }

    return user;
  }

  public async getMyProfile(
    user: TUser
  ): Promise<UserProfileCreationResponseDto> {
    const profile = await this.#profileRepository.getById(user.profileId);

    if (!profile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    return profile;
  }

  public async getUsersByUsername(
    username: string
  ): Promise<UserProfileCreationResponseDto[]> {
    return await this.#profileRepository.getByUsername(username);
  }
  public mapUser(document: UserDocument): TUser {
    return {
      createdAt: document.createdAt.toISOString(),
      email: document.email,
      id: document._id.toString(),
      profileId: document.profileId.toString(),
      role: document.role,
      updatedAt: document.updatedAt.toISOString()
    };
  }

  public async updateMyProfile(
    user: TUser,
    data: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto> {
    return await this.updateProfile(data, user.profileId);
  }

  public async updateOtherProfile(
    sender: TUser,
    id: string,
    data: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto> {
    if (sender.role !== UserRole.ADMIN) {
      throw new HTTPError({
        message: ExceptionMessage.FORBIDDEN,
        status: HTTPCode.FORBIDDEN
      });
    }

    return await this.updateProfile(data, id);
  }

  private async updateProfile(
    data: UserProfileCreationRequestDto,
    profileId: string
  ): Promise<UserProfileCreationResponseDto> {
    const profile = await this.#profileRepository.getById(profileId);

    if (!profile) {
      throw new HTTPError({
        message: ExceptionMessage.PROFILE_NOT_FOUND,
        status: HTTPCode.NOT_FOUND
      });
    }

    if (data.dateOfBirth && !isValidDateOfBirth(data.dateOfBirth.value)) {
      throw new HTTPError({
        message: ExceptionMessage.INVALID_DATE_OF_BIRTH,
        status: HTTPCode.BAD_REQUEST
      });
    }

    const { profilePicture, ...otherData } = data;
    let previousProfilePicture: string | undefined;

    if (profilePicture) {
      previousProfilePicture = profile.profilePicture;
      const fileName = await savePicture(profilePicture);
      profile.profilePicture = fileName;
    }

    for (const key of Object.keys(otherData) as Array<keyof typeof otherData>) {
      const field = otherData[key];

      if (field && 'value' in field) {
        if (key === 'language') {
          profile.language = field.value as ValueOf<typeof ProfileLanguage>;
        } else {
          profile[key] = field.value;
        }
      }
    }

    const updatedProfile = await this.#profileRepository.updateById(
      profileId,
      profile
    );

    if (!updatedProfile) {
      throw new HTTPError({
        message: ExceptionMessage.ERROR_UPDATING_PROFILE,
        status: HTTPCode.INTERNAL_SERVER_ERROR
      });
    }

    if (profilePicture && previousProfilePicture) {
      void deleteStoredUserMedia(previousProfilePicture).catch(() => {});
    }

    return updatedProfile;
  }
}

export { User };
