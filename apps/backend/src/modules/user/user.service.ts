import { ExceptionMessage } from '~/libs/enums/enums.js';
import { type Encryption } from '~/libs/modules/encryption/encryption.js';
import {
  isValidDateOfBirth,
  savePicture
} from '~/libs/modules/helpers/helpers.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
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

    if (profilePicture) {
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

    return updatedProfile;
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
      id: document.id as string,
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
}

export { User };
