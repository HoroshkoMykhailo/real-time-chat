import { ExceptionMessage } from '~/libs/enums/enums.js';
import { HTTPCode, HTTPError } from '~/libs/modules/http/http.js';
import { UserRole } from '~/modules/user/libs/enums/enums.js';
import { type User } from '~/modules/user/libs/types/types.js';

function assertAdmin(user: undefined | User): asserts user is User {
  if (!user || user.role !== UserRole.ADMIN) {
    throw new HTTPError({
      message: ExceptionMessage.FORBIDDEN,
      status: HTTPCode.FORBIDDEN
    });
  }
}

export { assertAdmin };
