const express = require('express');
const router = express.Router();
const socialLinkController = require('../controllers/socialLinkController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createSocialLinkSchema,
  updateSocialLinkSchema,
} = require('../validators/socialLinkValidators');

// Public route
router.get('/active', socialLinkController.getActiveSocialLinks);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), socialLinkController.adminGetAllSocialLinks);
router.post('/', authenticate, authorize('admin'), validate(createSocialLinkSchema), socialLinkController.createSocialLink);
router.patch('/:id', authenticate, authorize('admin'), validate(updateSocialLinkSchema), socialLinkController.updateSocialLink);
router.delete('/:id', authenticate, authorize('admin'), socialLinkController.deleteSocialLink);

module.exports = router;

