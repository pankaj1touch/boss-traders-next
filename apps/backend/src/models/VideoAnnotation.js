const mongoose = require('mongoose');

const videoAnnotationSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['marker', 'annotation', 'highlight', 'note'],
      default: 'annotation',
    },
    timestamp: {
      type: Number, // Video timestamp in seconds
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    color: {
      type: String,
      default: '#3b82f6', // Blue
    },
    position: {
      x: Number, // X position on video (0-100)
      y: Number, // Y position on video (0-100)
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // Visible to all students
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'file', 'link'],
        },
        url: String,
        name: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
videoAnnotationSchema.index({ courseId: 1, videoId: 1, timestamp: 1 });
videoAnnotationSchema.index({ courseId: 1, videoId: 1, createdBy: 1 });
videoAnnotationSchema.index({ isPublic: 1, isVisible: 1 });

module.exports = mongoose.model('VideoAnnotation', videoAnnotationSchema);


