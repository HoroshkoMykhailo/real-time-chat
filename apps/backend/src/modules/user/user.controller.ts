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

import { UserApiPath } from './libs/enums/enums.js';
import {
  type User as TUser,
  type UserProfileCreationRequestDto,
  type UserProfileCreationResponseDto,
  type UserService
} from './libs/types/types.js';
import { type UserController } from './libs/types/user-controller.type.js';
import { profileValidationSchema } from './libs/validation-schemas/validation-schemas.js';

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  logger: LoggerModule;
  userService: UserService;
};

class User extends Controller implements UserController {
  #userService: UserService;

  public getMyProfile = async (
    options: ControllerAPIHandlerOptions<{ user: TUser }>
  ): Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>> => {
    const { user } = options;

    return {
      payload: await this.#userService.getMyProfile(user),
      status: HTTPCode.OK
    };
  };

  public getUser = (
    options: ControllerAPIHandlerOptions<{ user: TUser }>
  ): ControllerAPIHandlerResponse<TUser> => {
    return {
      payload: options.user,
      status: HTTPCode.OK
    };
  };

  public getUsersByUsername = async (
    options: ControllerAPIHandlerOptions<{ query: { username: string } }>
  ): Promise<
    ControllerAPIHandlerResponse<UserProfileCreationResponseDto[]>
  > => {
    const { username } = options.query;

    return {
      payload: await this.#userService.getUsersByUsername(username),
      status: HTTPCode.OK
    };
  };

  public updateMyProfile = async (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>> => {
    const { body, user } = options;

    return {
      payload: await this.#userService.updateMyProfile(user, body),
      status: HTTPCode.OK
    };
  };

  public updateOtherProfile = async (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: { id: string };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>> => {
    const { body, params, user } = options;

    return {
      payload: await this.#userService.updateOtherProfile(
        user,
        params.id,
        body
      ),
      status: HTTPCode.OK
    };
  };

  public constructor({ apiPath, logger, userService }: Constructor) {
    super({ apiPath, logger });
    this.#userService = userService;

    this.addRoute({
      handler: this.updateMyProfile as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      schema: {
        body: profileValidationSchema
      },
      url: UserApiPath.PROFILE
    });

    this.addRoute({
      handler: this.updateOtherProfile as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      schema: {
        body: profileValidationSchema
      },
      url: UserApiPath.$PROFILE_ID
    });

    this.addRoute({
      handler: this.getMyProfile as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: UserApiPath.PROFILE
    });

    this.addRoute({
      handler: this.getUser as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: UserApiPath.ROOT
    });

    this.addRoute({
      handler: this.getUsersByUsername as ControllerAPIHandler,
      method: HTTPMethod.GET,
      url: UserApiPath.USERNAME
    });
  }
}

export { User };
