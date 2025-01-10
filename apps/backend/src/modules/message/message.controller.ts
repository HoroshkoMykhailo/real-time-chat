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

import { MessageApiPath } from './libs/enums/enums.js';
import { type MessageController } from './libs/types/message-controller.type.js';
import { type MessageService } from './libs/types/message-service.type.js';
import {
  type GetMessagesResponseDto,
  type MessageCreationResponseDto,
  type TextMessageRequestDto
} from './libs/types/types.js';
import { textMessageValidationSchema } from './libs/validation-schemas/validation-schemas.js';

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  logger: LoggerModule;
  messageService: MessageService;
};

class Message extends Controller implements MessageController {
  #messageService: MessageService;

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

  public deleteMessage = async (
    options: ControllerAPIHandlerOptions<{
      params: { messageId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<boolean>> => {
    const {
      params: { messageId },
      user
    } = options;

    return {
      payload: await this.#messageService.deleteMessage(user, messageId),
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

  public updateTextMessage = async (
    options: ControllerAPIHandlerOptions<{
      body: TextMessageRequestDto;
      params: { messageId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<MessageCreationResponseDto>> => {
    const {
      body,
      params: { messageId },
      user
    } = options;

    return {
      payload: await this.#messageService.updateText(user, messageId, body),
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
      handler: this.getMessagesByChatId as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: MessageApiPath.$CHAT_ID
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
      handler: this.deleteMessage as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: MessageApiPath.$MESSAGE_ID
    });
  }
}

export { Message };
