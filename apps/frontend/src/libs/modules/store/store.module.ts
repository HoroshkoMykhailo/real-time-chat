import { configureStore } from '@reduxjs/toolkit';

import { AppEnvironment } from '~/libs/enums/enums.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { authApi, authReducer } from '~/modules/auth/auth.js';
import { chatApi, chatReducer } from '~/modules/chat/chat.js';
import { messageApi, messageReducer } from '~/modules/messages/message.js';
import { profileApi, profileReducer } from '~/modules/profile/profile.js';
import { storageApi } from '~/modules/storage/storage.js';
import { userApi, userReducer } from '~/modules/user/user.js';

import {
  type ExtraArguments,
  type StoreInstance,
  type StoreModule
} from './libs/types/types.js';

class Store implements StoreModule {
  #instance: StoreInstance;

  public constructor(config: ConfigModule) {
    this.#instance = configureStore({
      devTools: config.ENV.APP.ENVIRONMENT !== AppEnvironment.PRODUCTION,
      middleware: getDefaultMiddleware => {
        return getDefaultMiddleware({
          thunk: {
            extraArgument: this.extraArguments
          }
        });
      },
      reducer: {
        auth: authReducer,
        chat: chatReducer,
        message: messageReducer,
        profile: profileReducer,
        user: userReducer
      }
    });
  }

  public get extraArguments(): ExtraArguments {
    return {
      authApi,
      chatApi,
      messageApi,
      profileApi,
      storageApi,
      userApi
    };
  }

  public get instance(): StoreInstance {
    return this.#instance;
  }
}

export { Store };
