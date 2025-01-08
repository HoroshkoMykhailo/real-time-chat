import Joi from 'joi';

import { multipartValueSchema } from '~/libs/validation-schemas/validation-schemas.js';

import { ChatValidationMessage, ChatValidationRule } from '../enums/enums.js';

const chatUpdate = Joi.object({
  groupPicture: Joi.object().optional().messages({
    'object.base': ChatValidationMessage.GROUP_PICTURE_VALIDATION_ERROR
  }),

  name: Joi.object({
    ...multipartValueSchema,
    value: Joi.string()
      .trim()
      .max(ChatValidationRule.NAME_MAX_LENGTH)
      .optional()
      .messages({
        'string.empty': ChatValidationMessage.NAME_EMPTY,
        'string.max': ChatValidationMessage.NAME_MAX_LENGTH
      })
  }).optional()
}).messages({
  'object.missing': ChatValidationMessage.EMPTY_BODY
});

export { chatUpdate };
