import Joi from 'joi';

import { UserPayloadKey } from '../../../user/libs/enums/user-payload-key.enum.js';
import { UserValidationMessage } from '../../../user/libs/enums/user-validation-message.enum.js';
import { UserValidationRule } from '../../../user/libs/enums/user-validation-rule.enum.js';

const signIn = Joi.object({
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
    })
});

export { signIn };
