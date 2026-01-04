const Joi = require('joi');

const createSocialLinkSchema = Joi.object({
  platform: Joi.string()
    .valid('facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'telegram', 'whatsapp')
    .required(),
  url: Joi.string().uri().required(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional(),
});

const updateSocialLinkSchema = Joi.object({
  url: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createSocialLinkSchema,
  updateSocialLinkSchema,
};

