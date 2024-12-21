import Joi from 'joi';

import {
  ProfileLanguage,
  ProfileValidationMessage,
  ProfileValidationRule
} from '../enums/enums.js';

const dateRegex = /^(?:\d{2}\.){2}\d{4}$/;

const profile = Joi.object({
  dateOfBirth: Joi.string().pattern(dateRegex).optional().messages({
    'string.empty': ProfileValidationMessage.DATE_OF_BIRTH_EMPTY,
    'string.pattern.base': ProfileValidationMessage.DATE_OF_BIRTH_INVALID
  }),
  description: Joi.string()
    .trim()
    .max(ProfileValidationRule.DESCRIPTION_MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': ProfileValidationMessage.DESCRIPRION_EMPTY,
      'string.max': ProfileValidationMessage.DESCRIPRION_MAX_LENGTH
    }),
  language: Joi.string()
    .valid(...Object.values(ProfileLanguage))
    .optional()
    .messages({
      'any.only': ProfileValidationMessage.LANGUAGE_INVALID,
      'string.empty': ProfileValidationMessage.LANGUAGE_EMPTY
    }),
  profilePicture: Joi.object().optional().messages({
    'object.base': ProfileValidationMessage.PROFILE_PICTURE_VALIDATION_ERROR
  }),
  username: Joi.string()
    .trim()
    .min(ProfileValidationRule.USERNAME_MIN_LENGTH)
    .max(ProfileValidationRule.USERNAME_MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': ProfileValidationMessage.USERNAME_EMPTY,
      'string.max': ProfileValidationMessage.USERNAME_MAX_LENGTH,
      'string.min': ProfileValidationMessage.USERNAME_MIN_LENGTH
    })
})
  .or('dateOfBirth', 'description', 'language', 'profilePicture', 'username')
  .messages({
    'object.missing': ProfileValidationMessage.EMPTY_BODY
  });

export { profile };
