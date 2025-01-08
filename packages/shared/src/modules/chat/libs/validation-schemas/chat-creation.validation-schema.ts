import Joi from 'joi';

import { multipartValueSchema } from '~/libs/validation-schemas/validation-schemas.js';

import {
  ChatType,
  ChatValidationMessage,
  ChatValidationRule
} from '../enums/enums.js';

const chatCreation = Joi.object({
  groupPicture: Joi.object().optional().messages({
    'object.base': ChatValidationMessage.GROUP_PICTURE_VALIDATION_ERROR
  }),

  members: Joi.array()
    .items(
      Joi.object({
        ...multipartValueSchema,
        value: Joi.string().trim().required()
      })
    )
    .min(ChatValidationRule.MEMBERS_MIN_COUNT)
    .required()
    .messages({
      'array.includesRequiredUnknowns': ChatValidationMessage.MEMBERS_INVALID,
      'array.min': ChatValidationMessage.MEMBERS_REQUIRED
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
  }).optional(),

  type: Joi.object({
    ...multipartValueSchema,
    value: Joi.string()
      .valid(...Object.values(ChatType))
      .required()
      .messages({
        'any.only': ChatValidationMessage.TYPE_INVALID,
        'string.empty': ChatValidationMessage.TYPE_EMPTY
      })
  }).required()
}).messages({
  'object.missing': ChatValidationMessage.EMPTY_BODY
});

export { chatCreation };
