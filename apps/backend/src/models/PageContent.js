const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema(
  {
    pageType: {
      type: String,
      required: true,
      unique: true,
      enum: ['about', 'contact', 'careers'],
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

pageContentSchema.index({ pageType: 1 });
pageContentSchema.index({ isActive: 1 });

module.exports = mongoose.model('PageContent', pageContentSchema);

