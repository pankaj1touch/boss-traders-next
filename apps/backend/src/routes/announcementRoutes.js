const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} = require('../validators/announcementValidators');
const {
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  trackView,
  trackClick,
} = require('../controllers/announcementController');

// Public routes - No authentication required
router.get('/active', getActiveAnnouncements);
router.post('/:id/view', trackView);
router.post('/:id/click', trackClick);

// Admin routes - require authentication and admin role
router.get('/', authenticate, authorize('admin'), getAllAnnouncements);
router.get('/:id', authenticate, authorize('admin'), getAnnouncementById);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createAnnouncementSchema),
  createAnnouncement
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateAnnouncementSchema),
  updateAnnouncement
);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

module.exports = router;

