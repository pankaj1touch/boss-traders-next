const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    videoUrl: String,
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'video', 'link', 'document'],
        },
      },
    ],
    durationMins: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);

