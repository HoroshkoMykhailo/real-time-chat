import { AdminApiPath } from '@team-link/shared';

import { type APIPath } from '~/libs/enums/enums.js';
import { assertAdmin } from '~/libs/modules/auth/assert-admin.helper.js';
import {
  Controller,
  type ControllerAPIHandler,
  type ControllerAPIHandlerOptions,
  type ControllerAPIHandlerResponse
} from '~/libs/modules/controller/controller.js';
import { HTTPCode, HTTPMethod } from '~/libs/modules/http/http.js';
import { type LoggerModule } from '~/libs/modules/logger/logger.js';
import { type ValueOf } from '~/libs/types/types.js';

import {
  type ChatGetResponseDto,
  type ChatsResponseDto
} from '../chat/libs/types/types.js';
import { type GetMessagesResponseDto } from '../message/libs/types/types.js';
import { type UserRole } from '../user/libs/enums/enums.js';
import { type User as TUser } from '../user/libs/types/types.js';
import {
  type AdminService,
  type AdminUserDetailDto,
  type AdminUserSummaryDto
} from './admin.service.js';
import { adminUpdateUserBodySchema } from './libs/validation-schemas/admin-update-user.validation-schema.js';

type Constructor = {
  adminService: AdminService;
  apiPath: ValueOf<typeof APIPath>;
  logger: LoggerModule;
};

class Admin extends Controller {
  #adminService: AdminService;

  public constructor({ adminService, apiPath, logger }: Constructor) {
    super({ apiPath, logger });
    this.#adminService = adminService;

    this.#registerRoutes();
  }

  public deleteUser = async (
    options: ControllerAPIHandlerOptions<{
      params: { userId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<{ deleted: true }>> => {
    const {
      params: { userId },
      user
    } = options;

    assertAdmin(user);

    return {
      payload: await this.#adminService.deleteUser(user, userId),
      status: HTTPCode.OK
    };
  };

  public getMonitoringChat = async (
    options: ControllerAPIHandlerOptions<{
      params: { chatId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<ChatGetResponseDto>> => {
    const {
      params: { chatId },
      user
    } = options;

    assertAdmin(user);

    return {
      payload: await this.#adminService.getMonitoringChat(chatId),
      status: HTTPCode.OK
    };
  };

  public getMonitoringMessages = async (
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

    assertAdmin(user);

    return {
      payload: await this.#adminService.getMonitoringMessages(chatId, query),
      status: HTTPCode.OK
    };
  };

  public getUserDetail = async (
    options: ControllerAPIHandlerOptions<{
      params: { userId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<AdminUserDetailDto>> => {
    const {
      params: { userId },
      user
    } = options;

    assertAdmin(user);

    return {
      payload: await this.#adminService.getUserDetail(userId),
      status: HTTPCode.OK
    };
  };

  public listChatsForMonitoring = async (
    options: ControllerAPIHandlerOptions<{ user: TUser }>
  ): Promise<ControllerAPIHandlerResponse<ChatsResponseDto>> => {
    const { user } = options;

    assertAdmin(user);

    return {
      payload: await this.#adminService.listChatsForMonitoring(),
      status: HTTPCode.OK
    };
  };

  public listUsers = async (
    options: ControllerAPIHandlerOptions<{ user: TUser }>
  ): Promise<ControllerAPIHandlerResponse<AdminUserSummaryDto[]>> => {
    const { user } = options;

    assertAdmin(user);

    return {
      payload: await this.#adminService.listUsers(),
      status: HTTPCode.OK
    };
  };

  public updateUser = async (
    options: ControllerAPIHandlerOptions<{
      body: {
        email?: string;
        role?: string;
        username?: string;
      };
      params: { userId: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<AdminUserDetailDto>> => {
    const { body, params, user } = options;

    assertAdmin(user);

    const { email, role, username } = body;

    return {
      payload: await this.#adminService.updateUser(params.userId, {
        ...(email !== undefined && { email }),
        ...(username !== undefined && { username }),
        ...(role !== undefined && {
          role: role as ValueOf<typeof UserRole>
        })
      }),
      status: HTTPCode.OK
    };
  };

  #registerRoutes(): void {
    this.addRoute({
      handler: this.getMonitoringMessages as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AdminApiPath.$CHAT_ID_MESSAGES
    });

    this.addRoute({
      handler: this.getMonitoringChat as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AdminApiPath.$CHAT_ID
    });

    this.addRoute({
      handler: this.listChatsForMonitoring as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AdminApiPath.CHATS
    });

    this.addRoute({
      handler: this.deleteUser as ControllerAPIHandler,
      method: HTTPMethod.DELETE,
      url: AdminApiPath.$USER_ID
    });

    this.addRoute({
      handler: this.updateUser as ControllerAPIHandler,
      method: HTTPMethod.PATCH,
      schema: {
        body: adminUpdateUserBodySchema
      },
      url: AdminApiPath.$USER_ID
    });

    this.addRoute({
      handler: this.getUserDetail as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AdminApiPath.$USER_ID
    });

    this.addRoute({
      handler: this.listUsers as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: AdminApiPath.USERS
    });
  }
}

export { Admin };
