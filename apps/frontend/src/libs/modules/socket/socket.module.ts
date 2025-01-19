import { io } from 'socket.io-client';

import { ENV } from '~/libs/enums/enums.js';

const socket = io(ENV.SERVER_URL);

export { socket };
