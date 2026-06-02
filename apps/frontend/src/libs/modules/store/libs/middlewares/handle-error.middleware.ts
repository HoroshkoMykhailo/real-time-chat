import { isRejected, type Middleware } from '@reduxjs/toolkit';

import { type ExtraArguments } from '../types/types.js';

const createHandleErrorChain =
  (toastNotifier: ExtraArguments['toastNotifier']) =>
  (next: (action: unknown) => unknown) =>
  (action: unknown): unknown => {
    if (isRejected(action)) {
      toastNotifier.showError(action.error.message ?? 'Unexpected error');
    }

    return next(action);
  };

const handleError = ({ toastNotifier }: ExtraArguments): Middleware => {
  return () => {
    return createHandleErrorChain(toastNotifier);
  };
};

export { handleError };
