import Joi from 'joi';

import { ChatPayloadKey } from '../enums/enums.js';

const updateLastViewedTime = Joi.object({
  [ChatPayloadKey.LAST_VIEWED_TIME]: Joi.string().isoDate().required()
});

export { updateLastViewedTime };
