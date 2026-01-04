const mongoose = require('mongoose');

const videoRatingSchema = new mongoose.Schema(
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
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate ratings
videoRatingSchema.index({ userId: 1, courseId: 1, videoId: 1 }, { unique: true });
videoRatingSchema.index({ courseId: 1, videoId: 1 });

module.exports = mongoose.model('VideoRating', videoRatingSchema);


