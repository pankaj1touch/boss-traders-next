const Joi = require('joi');

const createAnnouncementSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  body: Joi.string().required().trim().min(1),
  description: Joi.string().trim().max(500).allow('', null),
  type: Joi.string().valid('general', 'course', 'payment', 'educational', 'system', 'promotion').default('general'),
  audience: Joi.string().valid('all', 'students', 'instructors', 'admins').default('all'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  imageUrl: Joi.string().uri().allow('', null),
  linkUrl: Joi.string().uri().allow('', null),
  linkText: Joi.string().trim().max(50).default('Learn More'),
  isActive: Joi.boolean().default(true),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null),
  scheduledAt: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'scheduled', 'active', 'expired').default('draft'),
});

const updateAnnouncementSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  body: Joi.string().trim().min(1),
  description: Joi.string().trim().max(500).allow('', null),
  type: Joi.string().valid('general', 'course', 'payment', 'educational', 'system', 'promotion'),
  audience: Joi.string().valid('all', 'students', 'instructors', 'admins'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  imageUrl: Joi.string().uri().allow('', null),
  linkUrl: Joi.string().uri().allow('', null),
  linkText: Joi.string().trim().max(50),
  isActive: Joi.boolean(),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().allow(null),
  scheduledAt: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'scheduled', 'active', 'expired'),
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
};

