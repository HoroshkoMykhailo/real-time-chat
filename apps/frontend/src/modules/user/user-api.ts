import { APIPath } from '~/libs/enums/enums.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { UserApiPath } from './libs/enums/enums.js';
import {
  type UserApi,
  type UserProfileCreationResponseDto
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class User implements UserApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public getUsersByUsername(
    username: string
  ): Promise<UserProfileCreationResponseDto[]> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.USER}${UserApiPath.USERNAME}`,
      {
        method: HTTPMethod.GET,
        query: {
          username
        }
      }
    );
  }
}

export { User };
