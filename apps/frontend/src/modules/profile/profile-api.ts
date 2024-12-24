import { APIPath } from '~/libs/enums/enums.js';
import { convertToFormData } from '~/libs/helpers/helpers.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { UserApiPath } from './libs/enums/enums.js';
import {
  type ProfileApi,
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class Profile implements ProfileApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public getMyProfile(): Promise<UserProfileCreationResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.USER}${UserApiPath.PROFILE}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public updateMyProfile(
    payload: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.USER}${UserApiPath.PROFILE}`,
      {
        hasAuth: true,
        method: HTTPMethod.PUT,
        payload: formData
      }
    );
  }

  public updateOtherProfile(
    id: string,
    payload: UserProfileCreationRequestDto
  ): Promise<UserProfileCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.USER}${UserApiPath.$PROFILE_ID.replace(
        ':id',
        id
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.PUT,
        payload: formData
      }
    );
  }
}

export { Profile };
