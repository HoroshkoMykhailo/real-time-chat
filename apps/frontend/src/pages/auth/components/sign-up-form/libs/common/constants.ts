import { UserPayloadKey } from '~/modules/profile/libs/enums/enums.js';

const DEFAULT_REGISTRATION_PAYLOAD = {
  [UserPayloadKey.CONFIRM_PASSWORD]: '',
  [UserPayloadKey.EMAIL]: '',
  [UserPayloadKey.PASSWORD]: '',
  [UserPayloadKey.USERNAME]: ''
};

export { DEFAULT_REGISTRATION_PAYLOAD };
