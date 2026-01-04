const mongoose = require('mongoose');

const videoNoteSchema = new mongoose.Schema(
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
      maxlength: 5000,
    },
    timestamp: {
      type: Number, // Video timestamp in seconds
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    isBookmark: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient queries
videoNoteSchema.index({ userId: 1, courseId: 1, videoId: 1 });
videoNoteSchema.index({ userId: 1, isBookmark: 1 });

module.exports = mongoose.model('VideoNote', videoNoteSchema);


