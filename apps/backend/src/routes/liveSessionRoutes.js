const express = require('express');
const router = express.Router();
const liveSessionController = require('../controllers/liveSessionController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', liveSessionController.getAllLiveSessions);
router.get('/:id', liveSessionController.getSessionById);
router.post('/:id/join', authenticate, liveSessionController.joinSession);
router.post('/', authenticate, authorize('instructor', 'admin'), liveSessionController.createSession);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), liveSessionController.updateSession);
router.delete('/:id', authenticate, authorize('admin'), liveSessionController.deleteSession);

module.exports = router;

