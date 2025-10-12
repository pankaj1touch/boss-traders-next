const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { read, limit = 20 } = req.query;

    const query = { userId };
    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

