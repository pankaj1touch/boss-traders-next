const mongoose = require('mongoose');

const videoFavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
videoFavoriteSchema.index({ userId: 1, courseId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('VideoFavorite', videoFavoriteSchema);


