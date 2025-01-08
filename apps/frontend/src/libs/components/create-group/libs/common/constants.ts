import { ChatPayloadKey, ChatType } from '~/modules/chat/chat.js';

const DEFAULT_CREATE_GROUP_PAYLOAD = {
  [ChatPayloadKey.GROUP_PICTURE]: null,
  [ChatPayloadKey.MEMBERS]: [],
  [ChatPayloadKey.NAME]: '',
  [ChatPayloadKey.TYPE]: ChatType.GROUP
};

export { DEFAULT_CREATE_GROUP_PAYLOAD };
