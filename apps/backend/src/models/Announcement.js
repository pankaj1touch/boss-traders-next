const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'instructors', 'admins'],
      default: 'all',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    scheduledAt: Date,
    sentAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

announcementSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);

