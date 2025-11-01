const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', ebookController.getAllEbooks);
router.get('/:slug', ebookController.getEbookBySlug);

// Authenticated routes
router.get('/:id/download', authenticate, ebookController.downloadEbook);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), ebookController.adminGetAllEbooks);
router.get('/admin/:id', authenticate, authorize('admin'), ebookController.adminGetEbookById);
router.post('/', authenticate, authorize('admin'), ebookController.createEbook);
router.patch('/:id', authenticate, authorize('admin'), ebookController.updateEbook);
router.delete('/:id', authenticate, authorize('admin'), ebookController.deleteEbook);

module.exports = router;

