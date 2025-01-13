import { type Middleware, isRejected } from '@reduxjs/toolkit';

import {
  type AppDispatch,
  type RootState
} from '~/libs/modules/store/store.js';
import { authActions } from '~/modules/auth/auth.js';
import { ExceptionName } from '~/modules/http/http.js';

const handleUnauthorizedError = (): Middleware<
  object,
  RootState,
  AppDispatch
> => {
  return ({ dispatch }) => {
    return next => action => {
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
  };
};

export { handleUnauthorizedError };
