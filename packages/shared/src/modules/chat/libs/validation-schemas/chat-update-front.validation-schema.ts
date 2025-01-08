import Joi from 'joi';

import { ChatValidationMessage, ChatValidationRule } from '../enums/enums.js';

const chatUpdateFront = Joi.object({
  groupPicture: Joi.object().allow(null).optional().messages({
    'object.base': ChatValidationMessage.GROUP_PICTURE_VALIDATION_ERROR
  }),

  name: Joi.string()
    .trim()
    .max(ChatValidationRule.NAME_MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': ChatValidationMessage.NAME_EMPTY,
      'string.max': ChatValidationMessage.NAME_MAX_LENGTH
    })
}).messages({
  'object.missing': ChatValidationMessage.EMPTY_BODY
});

export { chatUpdateFront };
