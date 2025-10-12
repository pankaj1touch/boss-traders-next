const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createLessonSchema, updateLessonSchema } = require('../validators/lessonValidators');

router.get('/course/:courseId', optionalAuth, lessonController.getLessonsByCourse);
router.get('/:id', optionalAuth, lessonController.getLessonById);
router.post('/:id/complete', authenticate, lessonController.markLessonComplete);
router.post('/', authenticate, authorize('instructor', 'admin'), validate(createLessonSchema), lessonController.createLesson);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), validate(updateLessonSchema), lessonController.updateLesson);
router.delete('/:id', authenticate, authorize('admin'), lessonController.deleteLesson);

module.exports = router;

