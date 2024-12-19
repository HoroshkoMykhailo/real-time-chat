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

type Constructor = {
  apiPath: ValueOf<typeof APIPath>;
  logger: LoggerModule;
  userService: UserService;
};

class User extends Controller implements UserController {
  #userService: UserService;

  public updateProfile = async (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: {
        id: string;
      };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserProfileCreationResponseDto>> => {
    const { body, params, user } = options;

    return {
      payload: await this.#userService.updateProfile(user, params.id, body),
      status: HTTPCode.OK
    };
  };

  public constructor({ apiPath, logger, userService }: Constructor) {
    super({ apiPath, logger });
    this.#userService = userService;

    this.addRoute({
      handler: this.updateProfile as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      url: UserApiPath.$PROFILE_ID
    });
  }
}

export { User };
