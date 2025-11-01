const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema(
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
    author: {
      type: String,
      required: true,
    },
    cover: String,
    description: {
      type: String,
      required: true,
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
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: Number,
    pages: Number,
    format: {
      type: String,
      enum: ['pdf', 'epub', 'mobi'],
      default: 'pdf',
    },
    drmLevel: {
      type: String,
      enum: ['none', 'basic', 'advanced'],
      default: 'basic',
    },
    category: String,
    tags: [String],
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
    demoPages: {
      type: Number,
      default: 5, // number of pages to show in demo
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    previewUrl: String, // URL for demo/preview version
    isDemoAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ebookSchema.index({ slug: 1 });
ebookSchema.index({ category: 1, publishStatus: 1 });

module.exports = mongoose.model('Ebook', ebookSchema);

