const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createCourseSchema,
  updateCourseSchema,
  enrollCourseSchema,
} = require('../validators/courseValidators');

// Public routes
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/:slug', optionalAuth, courseController.getCourseBySlug);

// Authenticated routes
router.post('/:id/enroll', authenticate, validate(enrollCourseSchema), courseController.enrollInCourse);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), courseController.adminGetAllCourses);
router.get('/admin/:id', authenticate, authorize('admin'), courseController.adminGetCourseById);
router.post('/', authenticate, authorize('instructor', 'admin'), validate(createCourseSchema), courseController.createCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', authenticate, authorize('admin'), courseController.deleteCourse);

module.exports = router;

