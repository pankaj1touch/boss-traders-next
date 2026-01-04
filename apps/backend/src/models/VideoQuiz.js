const mongoose = require('mongoose');

const quizOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice',
  },
  options: [quizOptionSchema],
  correctAnswer: String, // For short-answer type
  points: {
    type: Number,
    default: 1,
  },
  explanation: String,
  timestamp: {
    type: Number, // Time in seconds when quiz appears
    default: 0,
  },
});

const videoQuizSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [quizQuestionSchema],
    passingScore: {
      type: Number,
      default: 70, // Percentage
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    allowRetake: {
      type: Boolean,
      default: true,
    },
    timeLimit: {
      type: Number, // Time limit in minutes (0 = no limit)
      default: 0,
    },
  },
  { timestamps: true }
);

videoQuizSchema.index({ courseId: 1, videoId: 1 });

module.exports = mongoose.model('VideoQuiz', videoQuizSchema);


