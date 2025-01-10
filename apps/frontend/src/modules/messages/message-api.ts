import { APIPath, ContentType } from '~/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { HTTPMethod } from '../http/libs/enums/enums.js';
import { MessageApiPath } from './libs/enums/enums.js';
import {
  type GetMessagesResponseDto,
  type MessageApi,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
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

  public deleteMessage(messageId: string): Promise<boolean> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(':messageId', messageId)}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
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

  public writeTextMessage(
    chatId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(':chatId', chatId)}${MessageApiPath.TEXT}`,
      {
        contentType: ContentType.JSON,
        hasAuth: true,
        method: HTTPMethod.POST,
        payload: JSON.stringify(content)
      }
    );
  }
}

export { Message };
