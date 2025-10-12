const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    hostLink: String,
    attendeeLink: String,
    recordingUrl: String,
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    maxAttendees: Number,
  },
  { timestamps: true }
);

liveSessionSchema.index({ courseId: 1, startAt: 1 });
liveSessionSchema.index({ batchId: 1 });

module.exports = mongoose.model('LiveSession', liveSessionSchema);

