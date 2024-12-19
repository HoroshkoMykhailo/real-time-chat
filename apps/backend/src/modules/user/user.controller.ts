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

  public createProfile = async (
    options: ControllerAPIHandlerOptions<{
      body: UserProfileCreationRequestDto;
      params: {
        userId: string;
      };
      user: TUser;
    }>
  ): Promise<ControllerAPIHandlerResponse<UserProfileCreationRequestDto>> => {
    const user = await this.#userService.find(options.user.id);

    return {
      payload: {
        username: user.email
      },
      status: HTTPCode.OK
    };
  };

  public constructor({ apiPath, logger, userService }: Constructor) {
    super({ apiPath, logger });
    this.#userService = userService;

    this.addRoute({
      handler: this.createProfile as ControllerAPIHandler,
      method: HTTPMethod.PUT,
      url: UserApiPath.$PROFILE_ID
    });
  }
}

export { User };
