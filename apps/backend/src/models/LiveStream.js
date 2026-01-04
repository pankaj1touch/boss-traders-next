const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    streamUrl: {
      type: String,
      required: true,
    },
    streamKey: {
      type: String,
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    thumbnail: {
      type: String,
    },
    isRecorded: {
      type: Boolean,
      default: true,
    },
    recordedVideoUrl: {
      type: String,
    },
    viewers: {
      type: Number,
      default: 0,
    },
    maxViewers: {
      type: Number,
    },
    chatEnabled: {
      type: Boolean,
      default: true,
    },
    qaEnabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
liveStreamSchema.index({ courseId: 1, scheduledAt: 1 });
liveStreamSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('LiveStream', liveStreamSchema);


