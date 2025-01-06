import { ENV } from '~/libs/enums/enums.js';
import { httpApi } from '~/modules/http/http.js';

import { Chat as ChatApi } from './chat-api.js';

const chatApi = new ChatApi({
  apiPath: ENV.API_PATH,
  httpApi
});

export { chatApi };
export { ChatApiPath, ChatPayloadKey, ChatType } from './libs/enums/enums.js';
export {
  actions as chatActions,
  reducer as chatReducer
} from './slices/chat.js';
