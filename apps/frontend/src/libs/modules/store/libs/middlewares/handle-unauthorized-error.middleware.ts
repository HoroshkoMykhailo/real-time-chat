import {
  isRejected,
  type Middleware,
  type MiddlewareAPI
} from '@reduxjs/toolkit';

import {
  type AppDispatch,
  type RootState
} from '~/libs/modules/store/store.js';
import { authActions } from '~/modules/auth/auth.js';
import { ExceptionName } from '~/modules/http/http.js';

const createUnauthorizedErrorChain =
  (dispatch: AppDispatch) =>
  (next: (action: unknown) => unknown) =>
  (action: unknown): unknown => {
    if (
      isRejected(action) &&
      action.error.name === ExceptionName.UNAUTHORIZED
    ) {
      if (isRejected(authActions.signIn)(action)) {
        return next(action);
      }

      void dispatch(authActions.logout());

      return;
    }

    return next(action);
  };

function bindUnauthorizedErrorMiddleware({
  dispatch
}: MiddlewareAPI<AppDispatch, RootState>): ReturnType<
  typeof createUnauthorizedErrorChain
> {
  return createUnauthorizedErrorChain(dispatch);
}

const handleUnauthorizedError = (): Middleware<
  object,
  RootState,
  AppDispatch
> => {
  return bindUnauthorizedErrorMiddleware;
};

export { handleUnauthorizedError };
