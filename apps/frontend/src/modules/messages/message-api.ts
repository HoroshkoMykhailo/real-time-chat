import { APIPath, ContentType } from '~/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { HTTPMethod } from '../http/libs/enums/enums.js';
import {
  MessageApiParams as MessageApiParameters,
  MessageApiPath
} from './libs/enums/enums.js';
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
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(MessageApiParameters.MESSAGE_ID, messageId)}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
  }

  public getMessages(chatId: string): Promise<GetMessagesResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public updatePinMessage(messageId: string): Promise<boolean> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(MessageApiParameters.MESSAGE_ID, messageId)}${MessageApiPath.PIN}`,
      {
        hasAuth: true,
        method: HTTPMethod.PUT
      }
    );
  }

  public updateTextMessage(
    messageId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(MessageApiParameters.MESSAGE_ID, messageId)}${MessageApiPath.TEXT}`,
      {
        contentType: ContentType.JSON,
        hasAuth: true,
        method: HTTPMethod.PUT,
        payload: JSON.stringify(content)
      }
    );
  }
  public writeTextMessage(
    chatId: string,
    content: TextMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}${MessageApiPath.TEXT}`,
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
