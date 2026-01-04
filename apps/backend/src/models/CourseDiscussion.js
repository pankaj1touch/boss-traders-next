const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isSolution: {
      type: Boolean,
      default: false, // Marked as solution by instructor/admin
    },
  },
  { timestamps: true }
);

const courseDiscussionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: ['general', 'question', 'help', 'feedback', 'announcement'],
      default: 'general',
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    replies: [discussionReplySchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
courseDiscussionSchema.index({ courseId: 1, createdAt: -1 });
courseDiscussionSchema.index({ courseId: 1, category: 1 });
courseDiscussionSchema.index({ courseId: 1, isPinned: -1, createdAt: -1 });
courseDiscussionSchema.index({ userId: 1 });

// Update lastActivity when reply is added
courseDiscussionSchema.pre('save', function (next) {
  if (this.isModified('replies')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('CourseDiscussion', courseDiscussionSchema);


