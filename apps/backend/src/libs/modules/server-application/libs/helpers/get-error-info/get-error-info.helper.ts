import { ServerErrorType } from '~/libs/enums/enums.js';
import { HTTPError } from '~/libs/modules/http/http.js';

import { type APIError, type ErrorInfo } from '../../types/types.js';
import { getDefaultErrorInfo } from './get-default-error-info.helper.js';
import { getValidationErrorInfo } from './get-validation-error-info.helper.js';

const getErrorInfo = (error: APIError): ErrorInfo => {
  if ('isJoi' in error) {
    return getValidationErrorInfo(error);
  }

  if (error instanceof HTTPError) {
    return {
      internalMessage: error.message,
      response: {
        errorType: ServerErrorType.COMMON,
        message: error.message
      },
      status: error.status
    };
  }

  return getDefaultErrorInfo(error);
};

export { getErrorInfo };
