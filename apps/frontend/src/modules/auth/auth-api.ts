import { APIPath, ContentType } from '~/libs/enums/enums.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { AuthApiPath, UserApiPath } from './libs/enums/enums.js';
import {
  type AuthApi,
  type User,
  type UserSignInRequestDto,
  type UserSignInResponseDto,
  type UserSignUpRequestDto,
  type UserSignUpResponseDto
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class Auth implements AuthApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public getUser(): Promise<User> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.USER}${UserApiPath.ROOT}`,
      {
        hasAuth: true
      }
    );
  }

  public signIn(payload: UserSignInRequestDto): Promise<UserSignInResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.AUTH}${AuthApiPath.SIGN_IN}`,
      {
        contentType: ContentType.JSON,
        hasAuth: false,
        method: HTTPMethod.POST,
        payload: JSON.stringify(payload)
      }
    );
  }

  public signUp(payload: UserSignUpRequestDto): Promise<UserSignUpResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.AUTH}${AuthApiPath.SIGN_UP}`,
      {
        contentType: ContentType.JSON,
        hasAuth: false,
        method: HTTPMethod.POST,
        payload: JSON.stringify(payload)
      }
    );
  }
}

export { Auth };
