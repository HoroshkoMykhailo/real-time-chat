import Joi from 'joi';

import {
  ChatType,
  ChatValidationMessage,
  ChatValidationRule
} from '../enums/enums.js';

const chatCreationFront = Joi.object({
  groupPicture: Joi.object().allow(null).optional().messages({
    'object.base': ChatValidationMessage.GROUP_PICTURE_VALIDATION_ERROR
  }),

  members: Joi.array()
    .items(Joi.string().trim().required())
    .min(ChatValidationRule.MEMBERS_MIN_COUNT)
    .required()
    .messages({
      'array.includesRequiredUnknowns': ChatValidationMessage.MEMBERS_INVALID,
      'array.min': ChatValidationMessage.MEMBERS_REQUIRED
    }),

  name: Joi.string()
    .trim()
    .max(ChatValidationRule.NAME_MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': ChatValidationMessage.NAME_EMPTY,
      'string.max': ChatValidationMessage.NAME_MAX_LENGTH
    }),

  type: Joi.string()
    .valid(...Object.values(ChatType))
    .required()
    .messages({
      'any.only': ChatValidationMessage.TYPE_INVALID,
      'string.empty': ChatValidationMessage.TYPE_EMPTY
    })
}).messages({
  'object.missing': ChatValidationMessage.EMPTY_BODY
});

export { chatCreationFront };
