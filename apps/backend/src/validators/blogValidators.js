const Joi = require('joi');

const createBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  excerpt: Joi.string().trim().max(300).required(),
  content: Joi.string().min(100).required(),
  featuredImage: Joi.string().uri().optional(),
  category: Joi.string().valid('technology', 'business', 'education', 'lifestyle', 'news', 'tutorials').required(),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional(),
  publishStatus: Joi.string().valid('draft', 'published', 'archived').optional(),
  featured: Joi.boolean().optional(),
  seoTitle: Joi.string().trim().max(60).optional(),
  seoDescription: Joi.string().trim().max(160).optional(),
});

const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  excerpt: Joi.string().trim().max(300).optional(),
  content: Joi.string().min(100).optional(),
  featuredImage: Joi.string().uri().optional(),
  category: Joi.string().valid('technology', 'business', 'education', 'lifestyle', 'news', 'tutorials').optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional(),
  publishStatus: Joi.string().valid('draft', 'published', 'archived').optional(),
  featured: Joi.boolean().optional(),
  seoTitle: Joi.string().trim().max(60).optional(),
  seoDescription: Joi.string().trim().max(160).optional(),
});

const blogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  category: Joi.string().valid('technology', 'business', 'education', 'lifestyle', 'news', 'tutorials').optional(),
  tag: Joi.string().trim().optional(),
  featured: Joi.boolean().optional(),
  search: Joi.string().trim().max(100).optional(),
  sort: Joi.string().valid('newest', 'oldest', 'popular', 'featured').optional(),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
};
