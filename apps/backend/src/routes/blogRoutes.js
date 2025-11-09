const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
} = require('../validators/blogValidators');

// Public routes
router.get('/', validateQuery(blogQuerySchema), blogController.getAllBlogs);
router.get('/related/:slug', blogController.getRelatedBlogs);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), validateQuery(blogQuerySchema), blogController.adminGetAllBlogs);
router.get('/admin/:id', authenticate, authorize('admin'), blogController.adminGetBlogById);
router.post('/', authenticate, authorize('admin'), validate(createBlogSchema), blogController.createBlog);
router.patch('/admin/:id', authenticate, authorize('admin'), validate(updateBlogSchema), blogController.updateBlog);
router.delete('/admin/:id', authenticate, authorize('admin'), blogController.deleteBlog);

// Public routes (must be after admin routes to avoid conflicts)
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
