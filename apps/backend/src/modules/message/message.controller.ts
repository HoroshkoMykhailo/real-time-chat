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
  }
}

export { Message };
