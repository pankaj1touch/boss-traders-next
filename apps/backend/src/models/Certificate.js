const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
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
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    score: {
      type: Number, // Overall course completion score/percentage
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    pdfUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);


