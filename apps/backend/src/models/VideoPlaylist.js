const mongoose = require('mongoose');

const videoPlaylistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    videos: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        videoId: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

videoPlaylistSchema.index({ userId: 1 });
videoPlaylistSchema.index({ isPublic: 1 });

module.exports = mongoose.model('VideoPlaylist', videoPlaylistSchema);


