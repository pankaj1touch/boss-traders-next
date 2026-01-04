const mongoose = require('mongoose');

const videoCommentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Number, // Video timestamp in seconds (optional)
      default: null,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoComment',
      default: null, // For replies
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
videoCommentSchema.index({ courseId: 1, videoId: 1, createdAt: -1 });
videoCommentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('VideoComment', videoCommentSchema);


