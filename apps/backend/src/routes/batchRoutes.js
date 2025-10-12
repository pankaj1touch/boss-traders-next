const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBatchSchema, updateBatchSchema } = require('../validators/batchValidators');

router.get('/', batchController.getAllBatches);
router.get('/:id', batchController.getBatchById);
router.post('/', authenticate, authorize('admin'), validate(createBatchSchema), batchController.createBatch);
router.patch('/:id', authenticate, authorize('admin'), validate(updateBatchSchema), batchController.updateBatch);
router.delete('/:id', authenticate, authorize('admin'), batchController.deleteBatch);

module.exports = router;

