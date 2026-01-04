const express = require('express');
const router = express.Router();
const pageContentController = require('../controllers/pageContentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createPageContentSchema,
  updatePageContentSchema,
} = require('../validators/pageContentValidators');

// Public route
router.get('/:pageType', pageContentController.getPageContent);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), pageContentController.adminGetAllPageContents);
router.get('/admin/:id', authenticate, authorize('admin'), pageContentController.adminGetPageContentById);
router.post('/', authenticate, authorize('admin'), validate(createPageContentSchema), pageContentController.createPageContent);
router.patch('/:id', authenticate, authorize('admin'), validate(updatePageContentSchema), pageContentController.updatePageContent);
router.delete('/:id', authenticate, authorize('admin'), pageContentController.deletePageContent);

module.exports = router;

