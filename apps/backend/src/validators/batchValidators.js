const Joi = require('joi');

const createBatchSchema = Joi.object({
  courseId: Joi.string().required(),
  locationId: Joi.string().required(),
  name: Joi.string().min(3).max(200).required(),
  capacity: Joi.number().integer().min(1).required(),
  rrule: Joi.string().optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  instructorId: Joi.string().required(),
});

const updateBatchSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  rrule: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  instructorId: Joi.string().optional(),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional(),
});

module.exports = {
  createBatchSchema,
  updateBatchSchema,
};

