import Joi from 'joi';

import { ChatPayloadKey, ChatValidationRule } from '../enums/enums.js';

const addMembers = Joi.object({
  [ChatPayloadKey.MEMBERS]: Joi.array()
    .items(Joi.string().trim())
    .min(ChatValidationRule.MEMBERS_MIN_COUNT)
    .required()
});

export { addMembers };
