const Joi = require('joi');

const createBannerSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().required().trim().min(1).max(1000),
  imageUrl: Joi.string().required().uri(),
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const updateBannerSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(1000),
  imageUrl: Joi.string().uri(),
  isActive: Joi.boolean(),
  order: Joi.number().integer().min(0),
});

module.exports = {
  createBannerSchema,
  updateBannerSchema,
};

