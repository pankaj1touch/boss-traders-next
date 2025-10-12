const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', ebookController.getAllEbooks);
router.get('/:slug', ebookController.getEbookBySlug);
router.get('/:id/download', authenticate, ebookController.downloadEbook);
router.post('/', authenticate, authorize('admin'), ebookController.createEbook);
router.patch('/:id', authenticate, authorize('admin'), ebookController.updateEbook);
router.delete('/:id', authenticate, authorize('admin'), ebookController.deleteEbook);

module.exports = router;

