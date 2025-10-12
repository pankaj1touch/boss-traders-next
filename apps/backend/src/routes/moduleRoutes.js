const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createModuleSchema, updateModuleSchema } = require('../validators/moduleValidators');

router.get('/course/:courseId', moduleController.getModulesByCourse);
router.post('/', authenticate, authorize('instructor', 'admin'), validate(createModuleSchema), moduleController.createModule);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), validate(updateModuleSchema), moduleController.updateModule);
router.delete('/:id', authenticate, authorize('admin'), moduleController.deleteModule);

module.exports = router;

