import {
  type ThunkMiddleware,
  type Tuple,
  type UnknownAction,
  type configureStore
} from '@reduxjs/toolkit';

import { type authApi, type authReducer } from '~/modules/auth/auth.js';
import { type chatApi, type chatReducer } from '~/modules/chat/chat.js';
import {
  type messageApi,
  type messageReducer
} from '~/modules/messages/message.js';
import {
  type profileApi,
  type profileReducer
} from '~/modules/profile/profile.js';
import { type storageApi } from '~/modules/storage/storage.js';
import { type userApi, type userReducer } from '~/modules/user/user.js';

type RootReducer = {
  auth: ReturnType<typeof authReducer>;
  chat: ReturnType<typeof chatReducer>;
  message: ReturnType<typeof messageReducer>;
  profile: ReturnType<typeof profileReducer>;
  user: ReturnType<typeof userReducer>;
};

type ExtraArguments = {
  authApi: typeof authApi;
  chatApi: typeof chatApi;
  messageApi: typeof messageApi;
  profileApi: typeof profileApi;
  storageApi: typeof storageApi;
  userApi: typeof userApi;
};

type StoreInstance = ReturnType<
  typeof configureStore<
    RootReducer,
    UnknownAction,
    Tuple<[ThunkMiddleware<RootReducer, UnknownAction, ExtraArguments>]>
  >
>;

type StoreModule = {
  extraArguments: ExtraArguments;
};

export { type ExtraArguments, type StoreInstance, type StoreModule };
