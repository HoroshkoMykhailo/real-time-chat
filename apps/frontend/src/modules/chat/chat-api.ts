import { APIPath, ContentType } from '~/libs/enums/enums.js';
import { convertToFormData } from '~/libs/helpers/helpers.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import { ChatApiPath } from './libs/enums/enums.js';
import {
  type ChatApi,
  type ChatCreationRequestDto,
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './libs/types/types.js';

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

  public addMembers(
    chatId: string,
    members: string[]
  ): Promise<ChatGetResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID.replace(
        ':id',
        chatId
      )}`,
      {
        contentType: ContentType.JSON,
        hasAuth: true,
        method: HTTPMethod.PUT,
        payload: JSON.stringify({ members })
      }
    );
  }

  public createChat(
    payload: ChatCreationRequestDto
  ): Promise<ChatCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(`${this.#apiPath}${APIPath.CHAT}`, {
      hasAuth: true,
      method: HTTPMethod.POST,
      payload: formData
    });
  }

  public deleteChat(chatId: string): Promise<boolean> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.$CHAT_ID.replace(
        ':id',
        chatId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
  }

  public getChat(chatId: string): Promise<ChatGetResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.$CHAT_ID.replace(
        ':id',
        chatId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
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

  public leaveChat(chatId: string): Promise<ChatGetResponseDto | null> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID.replace(
        ':id',
        chatId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
  }

  public removeMember(
    chatId: string,
    memberId: string
  ): Promise<ChatGetResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.CHAT}${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID.replace(
        ':id',
        chatId
      )}${ChatApiPath.$MEMBER_ID.replace(':memberId', memberId)}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
  }
}

export { Chat };
