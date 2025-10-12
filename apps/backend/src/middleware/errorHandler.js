const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      code: 'DUPLICATE_ERROR',
      message: `${field} already exists`,
      details: [err.message],
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'Invalid ID format',
      details: [err.message],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid token',
      details: [err.message],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 'TOKEN_EXPIRED',
      message: 'Token expired',
      details: [err.message],
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
    details: err.details || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found handler
const notFound = (req, res, next) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };

