import { configureStore } from '@reduxjs/toolkit';

import { AppEnvironment } from '~/libs/enums/enums.js';
import { type ConfigModule } from '~/libs/modules/config/config.js';
import { toastNotifier } from '~/libs/modules/toast-notifier/toast-notifier.js';
import { authApi, authReducer } from '~/modules/auth/auth.js';
import { chatApi, chatReducer } from '~/modules/chat/chat.js';
import { messageApi, messageReducer } from '~/modules/messages/message.js';
import { profileApi, profileReducer } from '~/modules/profile/profile.js';
import { storageApi } from '~/modules/storage/storage.js';
import { userApi, userReducer } from '~/modules/user/user.js';

import {
  handleErrorMiddleware,
  handleUnauthorizedErrorMiddleware
} from './libs/middlewares/middlewares.js';
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
          serializableCheck: {
            ignoredActions: ['messages/download-file/fulfilled'],
            ignoredPaths: ['message.fileBlob']
          },
          thunk: {
            extraArgument: this.extraArguments
          }
        }).prepend(
          handleUnauthorizedErrorMiddleware(),
          handleErrorMiddleware(this.extraArguments)
        );
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
      toastNotifier,
      userApi
    };
  }

  public get instance(): StoreInstance {
    return this.#instance;
  }
}

export { Store };
