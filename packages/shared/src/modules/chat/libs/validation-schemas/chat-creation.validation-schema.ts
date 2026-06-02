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

  // Multipart (`attachFieldsToBody`): one field whose `value` is a JSON array string (see `convertToFormData`).
  members: Joi.object({
    ...multipartValueSchema,
    value: Joi.string().trim().required()
  })
    .required()
    .messages({
      'object.base': ChatValidationMessage.MEMBERS_INVALID
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
