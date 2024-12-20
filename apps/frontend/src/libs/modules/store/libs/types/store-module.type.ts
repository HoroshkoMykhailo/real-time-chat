import {
  type ThunkMiddleware,
  type Tuple,
  type UnknownAction,
  type configureStore
} from '@reduxjs/toolkit';

import { type authApi, type authReducer } from '~/modules/auth/auth.js';
import {
  type profileApi,
  type profileReducer
} from '~/modules/profile/profile.js';
import { type storageApi } from '~/modules/storage/storage.js';

type RootReducer = {
  auth: ReturnType<typeof authReducer>;
  profile: ReturnType<typeof profileReducer>;
};

type ExtraArguments = {
  authApi: typeof authApi;
  profileApi: typeof profileApi;
  storageApi: typeof storageApi;
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
