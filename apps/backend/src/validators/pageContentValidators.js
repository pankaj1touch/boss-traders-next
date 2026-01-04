const Joi = require('joi');

const createPageContentSchema = Joi.object({
  pageType: Joi.string().valid('about', 'contact', 'careers').required(),
  title: Joi.string().trim().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  metaTitle: Joi.string().trim().max(200).optional().allow(''),
  metaDescription: Joi.string().trim().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const updatePageContentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  content: Joi.string().min(1).optional(),
  metaTitle: Joi.string().trim().max(200).optional().allow(''),
  metaDescription: Joi.string().trim().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createPageContentSchema,
  updatePageContentSchema,
};

