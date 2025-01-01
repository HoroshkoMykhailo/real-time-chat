import { APIPath } from '~/libs/enums/enums.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { ChatApiPath } from './libs/enums/enums.js';
import { type ChatApi, type ChatsResponseDto } from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class Chat implements ChatApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public getMyChats(): Promise<ChatsResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.MY_GROUPS}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }
}

export { Chat };