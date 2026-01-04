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
    videos: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
      videoUrl: {
        type: String,
        required: true,
      },
      videoQualities: [{
        quality: {
          type: String,
          enum: ['360p', '480p', '720p', '1080p', 'auto'],
        },
        url: String,
      }],
      duration: Number, // in seconds
      isFree: {
        type: Boolean,
        default: false,
      },
      order: {
        type: Number,
        default: 0,
      },
      thumbnail: String,
      chapters: [{
        title: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Number, // in seconds
          required: true,
        },
        description: String,
      }],
    }],
    totalDuration: {
      type: Number,
      default: 0, // total duration in seconds
    },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1, publishStatus: 1 });
courseSchema.index({ tags: 1 });

// Pre-save hook to calculate totalDuration
courseSchema.pre('save', function (next) {
  if (this.videos && Array.isArray(this.videos)) {
    this.totalDuration = this.videos.reduce((total, video) => {
      return total + (video.duration || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);

