const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    accessTier: {
      type: String,
      enum: ['basic', 'premium', 'lifetime'],
      default: 'basic',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    videoProgress: [
      {
        videoId: {
          type: String,
          required: true,
        },
        currentTime: {
          type: Number,
          default: 0,
        },
        duration: {
          type: Number,
          default: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

