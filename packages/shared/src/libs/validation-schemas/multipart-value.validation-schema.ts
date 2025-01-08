import Joi from 'joi';

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

export { multipartValueSchema };
