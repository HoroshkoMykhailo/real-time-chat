import { AdminApiPath, APIPath, ContentType } from '~/libs/enums/enums.js';
import { HTTPMethod } from '~/modules/http/libs/enums/enums.js';

import { type HttpApi } from '../http/http.js';
import {
  type AdminUserDetail,
  type AdminUserSummary,
  type ChatGetResponseDto,
  type ChatsResponseDto,
  type GetMessagesResponseDto
} from './libs/types/types.js';

type Constructor = {
  apiPath: string;
  httpApi: HttpApi;
};

class AdminApi {
  #apiPath: string;

  #httpApi: HttpApi;

  public constructor({ apiPath, httpApi }: Constructor) {
    this.#apiPath = apiPath;
    this.#httpApi = httpApi;
  }

  public deleteUser(userId: string): Promise<{ deleted: true }> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.$USER_ID.replace(
        ':userId',
        userId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.DELETE
      }
    );
  }

  public getMonitoringChat(chatId: string): Promise<ChatGetResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.$CHAT_ID.replace(
        ':chatId',
        chatId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public getMonitoringMessages(
    chatId: string,
    query?: { after?: string; before?: string; limit?: number }
  ): Promise<GetMessagesResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.$CHAT_ID_MESSAGES.replace(
        ':chatId',
        chatId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET,
        ...(query ? { query } : {})
      }
    );
  }

  public getUserDetail(userId: string): Promise<AdminUserDetail> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.$USER_ID.replace(
        ':userId',
        userId
      )}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public listChats(): Promise<ChatsResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.CHATS}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public listUsers(): Promise<AdminUserSummary[]> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.USERS}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
      }
    );
  }

  public updateUser(
    userId: string,
    body: { email?: string; role?: string; username?: string }
  ): Promise<AdminUserDetail> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.ADMIN}${AdminApiPath.$USER_ID.replace(
        ':userId',
        userId
      )}`,
      {
        contentType: ContentType.JSON,
        hasAuth: true,
        method: HTTPMethod.PATCH,
        payload: JSON.stringify(body)
      }
    );
  }
}

export { AdminApi };
