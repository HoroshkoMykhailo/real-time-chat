import { type APIPath } from '~/libs/enums/enums.js';
import {
  Controller,
  type ControllerAPIHandler,
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { HTTPCode, HTTPMethod } from '~/libs/modules/http/http.js';
import { type LoggerModule } from '~/libs/modules/logger/logger.js';
import { type ValueOf } from '~/libs/types/types.js';
import { type User as TUser } from '~/modules/user/user.js';

import { MessageApiPath, type MessageLanguage } from './libs/enums/enums.js';
import { type MessageController } from './libs/types/message-controller.type.js';
import { type MessageService } from './libs/types/message-service.type.js';
import {
  type FileMessageRequestDto,
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto,
  type TranslateMessageResponseDto
} from './libs/types/types.js';
import {
  fileMessageValidationSchema,
  textMessageValidationSchema
} from './libs/validation-schemas/validation-schemas.js';

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  logger: LoggerModule;
  messageService: MessageService;
};

class Message extends Controller implements MessageController {
  #messageService: MessageService;

  public createAudioMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.createAudio(user, body, chatId),
      status: HTTPCode.CREATED
    };
  };

  public createFileMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.createFile(user, body, chatId),
      status: HTTPCode.CREATED
    };
  };

  public createImageMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.createImage(user, body, chatId),
      status: HTTPCode.CREATED
    };
  };

  public createTextMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: TextMessageRequestDto;
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.createText(user, body, chatId),
      status: HTTPCode.CREATED
    };
  };

  public createVideoMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: FileMessageRequestDto;
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.createVideo(user, body, chatId),
      status: HTTPCode.CREATED
    };
  };

  public deleteMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<boolean>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#messageService.deleteMessage(user, id),
      status: HTTPCode.OK
    };
  };

  public downloadFileMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<Blob>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#messageService.downloadFile(user, id),
      status: HTTPCode.OK
    };
  };

  public getMessagesByChatId = async (
    options: ControllerAPIHandlerOptions<{
      params: { chatId: string };
      query: {
        after?: string;
        before?: string;
        limit?: number;
      };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<GetMessagesResponseDto>> => {
    const {
      params: { chatId },
      query,
      user
    } = options;

    return {
      payload: await this.#messageService.getMessagesByChatId(
        user,
        chatId,
        query
      ),
      status: HTTPCode.OK
    };
  };

  public getPinMessagesByChatId = async (
    options: ControllerAPIHandlerOptions<{
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<GetMessagesResponseDto>> => {
    const {
      params: { chatId },
      user
    } = options;

    return {
      payload: await this.#messageService.getPinMessagesByChatId(user, chatId),
      status: HTTPCode.OK
    };
  };

  public transcribeMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#messageService.transcribeMessage(user, id),
      status: HTTPCode.OK
    };
  };

  public translateMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      query: {
        language: ValueOf<typeof MessageLanguage>;
      };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<TranslateMessageResponseDto>> => {
    const {
      params: { id },
      query: { language },
      user
    } = options;

    return {
      payload: await this.#messageService.translateMessage(user, id, language),
      status: HTTPCode.OK
    };
  };

  public updatePinMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<boolean>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#messageService.updatePin(user, id),
      status: HTTPCode.OK
    };
  };

  public updateTextMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: TextMessageRequestDto;
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { id },
      user
    } = options;

    return {
      payload: await this.#messageService.updateText(user, id, body),
      status: HTTPCode.OK
    };
  };

  public constructor({ apiPath, logger, messageService }: Constructor) {
    super({ apiPath, logger });
    this.#messageService = messageService;

    this.addRoute({
      handler: this.createTextMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: textMessageValidationSchema
      },
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.TEXT}`
    });

    this.addRoute({
      handler: this.transcribeMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      url: `${MessageApiPath.$MESSAGE_ID}${MessageApiPath.TRANSCRIBE}`
    });

    this.addRoute({
      handler: this.getPinMessagesByChatId as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.PIN}`
    });

    this.addRoute({
      handler: this.getMessagesByChatId as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: MessageApiPath.$CHAT_ID
    });

    this.addRoute({
      handler: this.downloadFileMessage as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: `${MessageApiPath.$MESSAGE_ID}${MessageApiPath.FILE}`
    });

    this.addRoute({
      handler: this.createImageMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: fileMessageValidationSchema
      },
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.IMAGE}`
    });

    this.addRoute({
      handler: this.createVideoMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: fileMessageValidationSchema
      },
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.VIDEO}`
    });

    this.addRoute({
      handler: this.translateMessage as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: `${MessageApiPath.$MESSAGE_ID}${MessageApiPath.TRANSLATE}`
    });

    this.addRoute({
      handler: this.createFileMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: fileMessageValidationSchema
      },
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.FILE}`
    });

    this.addRoute({
      handler: this.createAudioMessage as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: fileMessageValidationSchema
      },
      url: `${MessageApiPath.$CHAT_ID}${MessageApiPath.AUDIO}`
    });

    this.addRoute({
      handler: this.updateTextMessage as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      schema: {
        body: textMessageValidationSchema
      },
      url: `${MessageApiPath.$MESSAGE_ID}${MessageApiPath.TEXT}`
    });

    this.addRoute({
      handler: this.updatePinMessage as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      url: `${MessageApiPath.$MESSAGE_ID}${MessageApiPath.PIN}`
    });

    this.addRoute({
      handler: this.deleteMessage as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: MessageApiPath.$MESSAGE_ID
    });
  }
}

export { Message };
