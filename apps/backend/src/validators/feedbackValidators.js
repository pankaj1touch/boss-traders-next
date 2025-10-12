const Joi = require('joi');

const createFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).optional(),
});

const updateFeedbackStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
  moderatorNote: Joi.string().optional(),
});

module.exports = {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
};

