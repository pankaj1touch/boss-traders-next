const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'course_enrolled',
        'live_session_reminder',
        'order_confirmation',
        'password_reset',
        'announcement',
        'feedback_response',
        'other',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'push', 'inapp'],
      default: 'inapp',
    },
    payload: {
      title: String,
      message: String,
      link: String,
      data: mongoose.Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

