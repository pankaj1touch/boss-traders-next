const mongoose = require('mongoose');

const videoSubtitleSchema = new mongoose.Schema(
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
    language: {
      type: String,
      required: true,
      default: 'en',
    },
    subtitleUrl: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['srt', 'vtt', 'ass'],
      default: 'vtt',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index
videoSubtitleSchema.index({ courseId: 1, videoId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('VideoSubtitle', videoSubtitleSchema);


