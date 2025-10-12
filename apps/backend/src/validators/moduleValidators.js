const Joi = require('joi');

const createModuleSchema = Joi.object({
  courseId: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().optional(),
  order: Joi.number().integer().min(0).default(0),
});

const updateModuleSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().optional(),
  order: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createModuleSchema,
  updateModuleSchema,
};

