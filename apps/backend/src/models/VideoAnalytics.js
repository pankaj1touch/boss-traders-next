const mongoose = require('mongoose');

const videoAnalyticsSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    watchTime: {
      type: Number, // Total watch time in seconds
      default: 0,
    },
    maxWatchTime: {
      type: Number, // Maximum watch time reached in seconds
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completionDate: {
      type: Date,
    },
    lastWatched: {
      type: Date,
      default: Date.now,
    },
    watchSessions: [
      {
        startTime: {
          type: Date,
          default: Date.now,
        },
        endTime: Date,
        duration: Number, // Duration in seconds
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient queries
videoAnalyticsSchema.index({ courseId: 1, videoId: 1, userId: 1 }, { unique: true });
videoAnalyticsSchema.index({ courseId: 1, videoId: 1 });
videoAnalyticsSchema.index({ userId: 1 });

module.exports = mongoose.model('VideoAnalytics', videoAnalyticsSchema);


