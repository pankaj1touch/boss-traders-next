const Joi = require('joi');

const enrollCourseSchema = Joi.object({
  batchId: Joi.string().optional(),
  accessTier: Joi.string().valid('basic', 'premium', 'lifetime').default('basic'),
});

// Video schema for validation
const videoSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow('').optional(),
  videoUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .custom((value, helpers) => {
      // Check if it's a valid video URL
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
      const isVideoExtension = videoExtensions.some(ext => 
        value.toLowerCase().includes(ext) || 
        value.toLowerCase().includes('video')
      );
      
      // Allow S3 URLs, CDN URLs, or direct video URLs
      const isS3Url = value.includes('s3') || value.includes('amazonaws.com');
      const isCDNUrl = value.includes('cloudfront') || value.includes('cdn');
      const isDirectVideo = videoExtensions.some(ext => value.toLowerCase().endsWith(ext));
      
      if (isS3Url || isCDNUrl || isDirectVideo || isVideoExtension) {
        return value;
      }
      
      // If it doesn't match video patterns, still allow it (might be a streaming URL)
      return value;
    })
    .messages({
      'string.uri': 'Video URL must be a valid URL',
    }),
  duration: Joi.number().min(0).optional(),
  isFree: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0),
  thumbnail: Joi.string().uri().allow('').optional(),
});

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
  videos: Joi.array().items(videoSchema).optional(),
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
  videos: Joi.array().items(videoSchema).optional(),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  enrollCourseSchema,
  videoSchema,
};
