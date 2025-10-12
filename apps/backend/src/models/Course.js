const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    language: {
      type: String,
      default: 'English',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    tags: [String],
    thumbnail: String,
    description: {
      type: String,
      required: true,
    },
    outcomes: [String],
    prerequisites: [String],
    modality: {
      type: String,
      enum: ['live', 'recorded', 'hybrid'],
      default: 'recorded',
    },
    publishStatus: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1, publishStatus: 1 });
courseSchema.index({ tags: 1 });

module.exports = mongoose.model('Course', courseSchema);

