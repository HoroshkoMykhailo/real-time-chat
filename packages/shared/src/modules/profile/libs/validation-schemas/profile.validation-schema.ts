import Joi from 'joi';

import {
  ProfileLanguage,
  ProfileValidationMessage,
  ProfileValidationRule
} from '../enums/enums.js';

const dateRegex = /^(?:\d{2}\.){2}\d{4}$/;

const multipartValueSchema = {
  encoding: Joi.string().optional(),
  fieldname: Joi.string().optional(),
  fieldnameTruncated: Joi.boolean().optional(),
  fields: Joi.object().optional(),
  mimetype: Joi.string().optional(),
  type: Joi.string().optional(),
  value: Joi.any(),
  valueTruncated: Joi.boolean().optional()
};

const profile = Joi.object({
  dateOfBirth: Joi.object({
    ...multipartValueSchema,
    value: Joi.string().pattern(dateRegex).optional().messages({
      'string.empty': ProfileValidationMessage.DATE_OF_BIRTH_EMPTY,
      'string.pattern.base': ProfileValidationMessage.DATE_OF_BIRTH_INVALID
    })
  }).optional(),

  description: Joi.object({
    ...multipartValueSchema,
    value: Joi.string()
      .trim()
      .max(ProfileValidationRule.DESCRIPTION_MAX_LENGTH)
      .optional()
      .messages({
        'string.empty': ProfileValidationMessage.DESCRIPTION_EMPTY,
        'string.max': ProfileValidationMessage.DESCRIPTION_MAX_LENGTH
      })
  }).optional(),

  language: Joi.object({
    ...multipartValueSchema,
    value: Joi.string()
      .valid(...Object.values(ProfileLanguage))
      .optional()
      .messages({
        'any.only': ProfileValidationMessage.LANGUAGE_INVALID,
        'string.empty': ProfileValidationMessage.LANGUAGE_EMPTY
      })
  }).optional(),

  profilePicture: Joi.object().optional().messages({
    'object.base': ProfileValidationMessage.PROFILE_PICTURE_VALIDATION_ERROR
  }),

  username: Joi.object({
    ...multipartValueSchema,
    value: Joi.string()
      .trim()
      .min(ProfileValidationRule.USERNAME_MIN_LENGTH)
      .max(ProfileValidationRule.USERNAME_MAX_LENGTH)
      .optional()
      .messages({
        'string.empty': ProfileValidationMessage.USERNAME_EMPTY,
        'string.max': ProfileValidationMessage.USERNAME_MAX_LENGTH,
        'string.min': ProfileValidationMessage.USERNAME_MIN_LENGTH
      })
  }).optional()
})
  .or('dateOfBirth', 'description', 'language', 'profilePicture', 'username')
  .messages({
    'object.missing': ProfileValidationMessage.EMPTY_BODY
  });

export { profile };
