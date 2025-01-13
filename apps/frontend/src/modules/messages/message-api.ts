import { APIPath, ContentType } from '~/libs/enums/enums.js';
import { convertToFormData } from '~/libs/helpers/helpers.js';
import { type ValueOf } from '~/libs/types/types.js';

import { type HttpApi } from '../http/http.js';
import { HTTPMethod } from '../http/libs/enums/enums.js';
import {
  MessageApiParams as MessageApiParameters,
  MessageApiPath,
  type MessageLanguage
} from './libs/enums/enums.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageApi,
  type MessageCreationResponseDto,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
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

  public downloadFile(messageId: string): Promise<Blob> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(MessageApiParameters.MESSAGE_ID, messageId)}${MessageApiPath.FILE}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET
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

  public translateMessage(
    messageId: string,
    language: ValueOf<typeof MessageLanguage>
  ): Promise<TranslateMessageResponseDto> {
    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$MESSAGE_ID.replace(MessageApiParameters.MESSAGE_ID, messageId)}${MessageApiPath.TRANSLATE}`,
      {
        hasAuth: true,
        method: HTTPMethod.GET,
        query: {
          language
        }
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

  public writeAudioMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}${MessageApiPath.AUDIO}`,
      {
        hasAuth: true,
        method: HTTPMethod.POST,
        payload: formData
      }
    );
  }

  public writeFileMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}${MessageApiPath.FILE}`,
      {
        hasAuth: true,
        method: HTTPMethod.POST,
        payload: formData
      }
    );
  }

  public writeImageMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}${MessageApiPath.IMAGE}`,
      {
        hasAuth: true,
        method: HTTPMethod.POST,
        payload: formData
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
  public writeVideoMessage(
    chatId: string,
    payload: FileMessageRequestDto
  ): Promise<MessageCreationResponseDto> {
    const formData = convertToFormData(payload);

    return this.#httpApi.load(
      `${this.#apiPath}${APIPath.MESSAGE}${MessageApiPath.$CHAT_ID.replace(MessageApiParameters.CHAT_ID, chatId)}${MessageApiPath.VIDEO}`,
      {
        hasAuth: true,
        method: HTTPMethod.POST,
        payload: formData
      }
    );
  }
}

export { Message };
