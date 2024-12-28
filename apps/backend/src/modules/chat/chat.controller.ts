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

import { ChatApiPath } from './libs/enums/enums.js';
import { type ChatController } from './libs/types/chat-controller.type.js';
import { type ChatCreationRequestDto } from './libs/types/chat-creation-request-dto.type.js';
import { type ChatService } from './libs/types/chat-service.type.js';
import {
  type ChatCreationResponseDto,
  type ChatGetResponseDto,
  type ChatsResponseDto
} from './libs/types/types.js';
import {
  addMembersValidationSchema,
  chatCreationValidationSchema
} from './libs/validation-schemas/validation-schemas.js';

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  chatService: ChatService;
  logger: LoggerModule;
};

class Chat extends Controller implements ChatController {
  #chatService: ChatService;

  public addMembers = async (
    options: ControllerAPIHandlerOptions<{
      body: { members: string[] };
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>> => {
    const {
      body: { members },
      params: { id },
      user
    } = options;

    return {
      payload: await this.#chatService.addMembers(id, user, members),
      status: HTTPCode.OK
    };
  };

  public createChat = async (
    options: ControllerAPIHandlerOptions<{
      body: ChatCreationRequestDto;
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatCreationResponseDto>> => {
    const { body, user } = options;

    return {
      payload: await this.#chatService.create(user, body),
      status: HTTPCode.CREATED
    };
  };

  public deleteChat = async (
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
      payload: await this.#chatService.deleteChat(id, user),
      status: HTTPCode.OK
    };
  };

  public getChat = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#chatService.getChat(id, user),
      status: HTTPCode.OK
    };
  };

  public getMyChats = async (
    options: ControllerAPIHandlerOptions<{ user: TUser }>
  ): Promise<ControllerAPIHandlerResponse<ChatsResponseDto>> => {
    const { user } = options;

    return {
      payload: await this.#chatService.getMyChats(user),
      status: HTTPCode.OK
    };
  };

  public leaveChat = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatGetResponseDto | null>> => {
    const {
      params: { id },
      user
    } = options;

    return {
      payload: await this.#chatService.leaveChat(id, user),
      status: HTTPCode.OK
    };
  };

  public removeMember = async (
    options: ControllerAPIHandlerOptions<{
      params: { id: string; memberId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>> => {
    const {
      params: { id, memberId },
      user
    } = options;

    return {
      payload: await this.#chatService.removeMember(id, user, memberId),
      status: HTTPCode.OK
    };
  };

  public constructor({ apiPath, chatService, logger }: Constructor) {
    super({ apiPath, logger });
    this.#chatService = chatService;

    this.addRoute({
      handler: this.createChat as ControllerAPIHandler,
      method: HTTPMethod.POST,
      schema: {
        body: chatCreationValidationSchema
      },
      url: ChatApiPath.ROOT
    });

    this.addRoute({
      handler: this.getChat as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: ChatApiPath.$CHAT_ID
    });

    this.addRoute({
      handler: this.getMyChats as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: ChatApiPath.MY_GROUPS
    });

    this.addRoute({
      handler: this.addMembers as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      schema: {
        body: addMembersValidationSchema
      },
      url: `${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID}`
    });

    this.addRoute({
      handler: this.removeMember as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: `${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID}${ChatApiPath.$MEMBER_ID}`
    });

    this.addRoute({
      handler: this.leaveChat as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: `${ChatApiPath.MEMBERS}${ChatApiPath.$CHAT_ID}`
    });

    this.addRoute({
      handler: this.deleteChat as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: ChatApiPath.$CHAT_ID
    });
  }
}

export { Chat };
