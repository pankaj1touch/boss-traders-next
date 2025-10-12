const Joi = require('joi');

const createLessonSchema = Joi.object({
  courseId: Joi.string().required(),
  moduleId: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().optional(),
  videoUrl: Joi.string().uri().optional(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required(),
      type: Joi.string().valid('pdf', 'video', 'link', 'document').required(),
    })
  ).optional(),
  durationMins: Joi.number().integer().min(0).default(0),
  order: Joi.number().integer().min(0).default(0),
  isFree: Joi.boolean().default(false),
});

const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().optional(),
  videoUrl: Joi.string().uri().optional(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required(),
      type: Joi.string().valid('pdf', 'video', 'link', 'document').required(),
    })
  ).optional(),
  durationMins: Joi.number().integer().min(0).optional(),
  order: Joi.number().integer().min(0).optional(),
  isFree: Joi.boolean().optional(),
});

module.exports = {
  createLessonSchema,
  updateLessonSchema,
};

