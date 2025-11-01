const Joi = require('joi');

const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/).required(),
  category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'data-science', 'other').required(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).optional(),
  language: Joi.string().default('English'),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  tags: Joi.array().items(Joi.string()).default([]),
  thumbnail: Joi.string().uri().allow('').optional(),
  description: Joi.string().min(10).required(),
  outcomes: Joi.array().items(Joi.string()).default([]),
  prerequisites: Joi.array().items(Joi.string()).default([]),
  modality: Joi.string().valid('live', 'recorded', 'hybrid').default('recorded'),
  publishStatus: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  instructorId: Joi.string().optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'data-science', 'other').optional(),
  price: Joi.number().min(0).optional(),
  salePrice: Joi.number().min(0).optional(),
  language: Joi.string().optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  thumbnail: Joi.string().uri().optional(),
  description: Joi.string().min(10).optional(),
  outcomes: Joi.array().items(Joi.string()).optional(),
  prerequisites: Joi.array().items(Joi.string()).optional(),
  modality: Joi.string().valid('live', 'recorded', 'hybrid').optional(),
  publishStatus: Joi.string().valid('draft', 'published', 'archived').optional(),
});

const enrollCourseSchema = Joi.object({
  batchId: Joi.string().optional(),
  accessTier: Joi.string().valid('basic', 'premium', 'lifetime').default('basic'),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  enrollCourseSchema,
};

