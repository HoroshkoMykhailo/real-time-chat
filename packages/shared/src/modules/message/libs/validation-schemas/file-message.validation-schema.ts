import Joi from 'joi';

import { MessageValidationMessage } from '../enums/enums.js';

const fileMessage = Joi.object({
  file: Joi.object().optional().messages({
    'object.base': MessageValidationMessage.FILE_VALIDATION_ERROR
  })
}).messages({
  'object.missing': MessageValidationMessage.EMPTY_BODY
});

export { fileMessage };
