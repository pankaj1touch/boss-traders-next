const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { read, limit = 50 } = req.query;

    const query = { userId };
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('courseId', 'title slug thumbnail')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this notification',
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this notification',
      });
    }

    await notification.deleteOne();

    res.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
