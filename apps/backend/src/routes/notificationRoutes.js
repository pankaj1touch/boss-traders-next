const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Get notifications
router.get('/', authenticate, notificationController.getNotifications);

// Mark as read
router.patch('/:notificationId/read', authenticate, notificationController.markNotificationAsRead);

// Mark all as read
router.patch('/read-all', authenticate, notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

module.exports = router;
