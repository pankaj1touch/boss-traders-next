const Joi = require('joi');

const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Code must contain only uppercase letters and numbers',
    }),
  type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().min(0).required(),
  minPurchaseAmount: Joi.number().min(0).default(0),
  maxDiscountAmount: Joi.number().min(0).allow(null).when('type', {
    is: 'percentage',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  applicableTo: Joi.string()
    .valid('all', 'courses', 'ebooks', 'demo-classes', 'specific')
    .default('all'),
  specificItems: Joi.when('applicableTo', {
    is: 'specific',
    then: Joi.array().items(Joi.string()).min(1).required(),
    otherwise: Joi.array().items(Joi.string()).optional().default([]),
  }),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().greater('now').required(),
  usageLimit: Joi.number().integer().min(1).allow(null).default(null),
  userLimit: Joi.number().integer().min(1).default(1),
  isActive: Joi.boolean().default(true),
  description: Joi.string().trim().max(500).allow('', null),
});

const updateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .messages({
      'string.pattern.base': 'Code must contain only uppercase letters and numbers',
    }),
  type: Joi.string().valid('percentage', 'fixed'),
  value: Joi.number().min(0),
  minPurchaseAmount: Joi.number().min(0),
  maxDiscountAmount: Joi.number().min(0).allow(null),
  applicableTo: Joi.string().valid('all', 'courses', 'ebooks', 'demo-classes', 'specific'),
  specificItems: Joi.array().items(Joi.string()),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso(),
  usageLimit: Joi.number().integer().min(1).allow(null),
  userLimit: Joi.number().integer().min(1),
  isActive: Joi.boolean(),
  description: Joi.string().trim().max(500).allow('', null),
});

const validateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  items: Joi.array()
    .items(
      Joi.object({
        courseId: Joi.string().optional(),
        ebookId: Joi.string().optional(),
        demoClassId: Joi.string().optional(),
      })
    )
    .min(1)
    .required(),
  userId: Joi.string().optional(), // For user limit check
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
};

