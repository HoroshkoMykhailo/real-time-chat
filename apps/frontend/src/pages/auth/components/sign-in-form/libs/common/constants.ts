import { UserPayloadKey } from '~/modules/profile/libs/enums/enums.js';

const DEFAULT_SIGN_IN_PAYLOAD = {
  [UserPayloadKey.EMAIL]: '',
  [UserPayloadKey.PASSWORD]: ''
};

export { DEFAULT_SIGN_IN_PAYLOAD };
