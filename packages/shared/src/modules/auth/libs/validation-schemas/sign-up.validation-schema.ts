import Joi from 'joi';

import {
  UserPayloadKey,
  UserValidationMessage,
  UserValidationRule
} from '../../../user/user.js';

const signUp = Joi.object({
  [UserPayloadKey.CONFIRM_PASSWORD]: Joi.string()
    .valid(Joi.ref(UserPayloadKey.PASSWORD))
    .required()
    .messages({
      'any.only': UserValidationMessage.CONFIRM_PASSWORD_MATCH,
      'any.required': UserValidationMessage.CONFIRM_PASSWORD_REQUIRE
    }),
  [UserPayloadKey.EMAIL]: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'any.required': UserValidationMessage.EMAIL_REQUIRE,
      'string.email': UserValidationMessage.EMAIL_WRONG,
      'string.empty': UserValidationMessage.EMAIL_REQUIRE
    }),
  [UserPayloadKey.PASSWORD]: Joi.string()
    .trim()
    .min(UserValidationRule.PASSWORD_MIN_LENGTH)
    .max(UserValidationRule.PASSWORD_MAX_LENGTH)
    .required()
    .messages({
      'any.required': UserValidationMessage.PASSWORD_REQUIRE,
      'string.empty': UserValidationMessage.PASSWORD_REQUIRE,
      'string.max': UserValidationMessage.PASSWORD_MAX_LENGTH,
      'string.min': UserValidationMessage.PASSWORD_MIN_LENGTH
    }),
  [UserPayloadKey.USERNAME]: Joi.string()
    .trim()
    .min(UserValidationRule.USERNAME_MIN_LENGTH)
    .max(UserValidationRule.USERNAME_MAX_LENGTH)
    .required()
    .messages({
      'any.required': UserValidationMessage.USERNAME_REQUIRE,
      'string.empty': UserValidationMessage.USERNAME_REQUIRE,
      'string.max': UserValidationMessage.USERNAME_MAX_LENGTH,
      'string.min': UserValidationMessage.USERNAME_MIN_LENGTH
    })
});

export { signUp };
