const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
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
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['technology', 'business', 'education', 'lifestyle', 'news', 'tutorials'],
    },
    tags: [String],
    publishStatus: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1, publishStatus: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ featured: 1, publishStatus: 1 });
blogSchema.index({ tags: 1 });

// Virtual for reading time estimation
blogSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const content = typeof this.content === 'string' ? this.content : '';
  if (!content.trim()) {
    return 1;
  }
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
