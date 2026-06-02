import Joi from 'joi';

import { UserRole } from '~/modules/user/libs/enums/enums.js';

const USERNAME_MIN = 3;

const USERNAME_MAX = 30;

const MIN_BODY_FIELDS = 1;

const adminUpdateUserBodySchema = Joi.object({
  email: Joi.string().trim().email().optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
  username: Joi.string().trim().min(USERNAME_MIN).max(USERNAME_MAX).optional()
})
  .min(MIN_BODY_FIELDS)
  .messages({
    'object.min': 'At least one field must be provided.'
  });

export { adminUpdateUserBodySchema };
