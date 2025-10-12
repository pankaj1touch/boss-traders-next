const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
} = require('../validators/feedbackValidators');

router.post('/courses/:courseId', authenticate, validate(createFeedbackSchema), feedbackController.createFeedback);
router.get('/courses/:courseId', feedbackController.getCourseFeedback);
router.patch('/:id/status', authenticate, authorize('admin'), validate(updateFeedbackStatusSchema), feedbackController.updateFeedbackStatus);
router.delete('/:id', authenticate, feedbackController.deleteFeedback);

module.exports = router;

