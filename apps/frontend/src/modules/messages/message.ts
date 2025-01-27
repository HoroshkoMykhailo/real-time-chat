import { ENV } from '~/libs/enums/enums.js';
import { httpApi } from '~/modules/http/http.js';

import { Message as MessageApi } from './message-api.js';

const messageApi = new MessageApi({
  apiPath: ENV.API_PATH,
  httpApi
});

export { messageApi };
export { MessageLanguage, MessageType } from './libs/enums/enums.js';
export { type MessageHistoryItem } from './libs/types/types.js';
export { textMessageValidationSchema } from './libs/validation-schemas/validation-schemas.js';
export {
  actions as messageActions,
  reducer as messageReducer
} from './slices/message.js';
