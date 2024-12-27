import Joi from 'joi';

import {
  MessagePayloadKey,
  MessageValidationMessage,
  MessageValidationRule
} from '../enums/enums.js';

const textMessage = Joi.object({
  [MessagePayloadKey.CONTENT]: Joi.string()
    .trim()
    .min(MessageValidationRule.TEXT_CONTENT_MIN_LENGTH)
    .max(MessageValidationRule.TEXT_CONTENT_MAX_LENGTH)
    .required()
    .messages({
      'any.required': MessageValidationMessage.TEXT_CONTENT_REQUIRE,
      'string.empty': MessageValidationMessage.TEXT_CONTENT_REQUIRE,
      'string.max': MessageValidationMessage.TEXT_CONTENT_MAX_LENGTH,
      'string.min': MessageValidationMessage.TEXT_CONTENT_MIN_LENGTH
    })
});

export { textMessage };
