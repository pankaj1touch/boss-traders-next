const mongoose = require('mongoose');

const transcriptionSegmentSchema = new mongoose.Schema({
  start: {
    type: Number,
    required: true,
  },
  end: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    default: 0,
  },
});

const videoTranscriptionSchema = new mongoose.Schema(
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
      default: 'en',
    },
    segments: [transcriptionSegmentSchema],
    fullText: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    provider: {
      type: String,
      enum: ['manual', 'aws-transcribe', 'google-speech', 'whisper'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

// Compound index
videoTranscriptionSchema.index({ courseId: 1, videoId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('VideoTranscription', videoTranscriptionSchema);


