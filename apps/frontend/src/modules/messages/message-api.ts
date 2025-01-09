import { APIPath } from '~/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { HTTPMethod } from '../http/libs/enums/enums.js';
import { MessageApiPath } from './libs/enums/enums.js';
import {
  type GetMessagesResponseDto,
  type MessageApi
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class Message implements MessageApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public getMessages(chatId: string): Promise<GetMessagesResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(':chatId', chatId)}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }
}

export { Message };
