const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['general', 'course', 'payment', 'educational', 'system', 'promotion'],
      default: 'general',
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'instructors', 'admins'],
      default: 'all',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    linkUrl: {
      type: String,
      default: null,
    },
    linkText: {
      type: String,
      default: 'Learn More',
      maxlength: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    scheduledAt: Date,
    sentAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'expired'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
announcementSchema.index({ status: 1, isActive: 1 });
announcementSchema.index({ status: 1, scheduledAt: 1 });
announcementSchema.index({ endDate: 1 });
announcementSchema.index({ type: 1, priority: 1 });
announcementSchema.index({ createdAt: -1 });

// Virtual to check if announcement is expired
announcementSchema.virtual('isExpired').get(function () {
  if (this.endDate) {
    return new Date() > this.endDate;
  }
  return false;
});

// Pre-save middleware to auto-update status based on dates
announcementSchema.pre('save', function (next) {
  const now = new Date();
  
  // Auto-expire if endDate has passed
  if (this.endDate && now > this.endDate) {
    this.status = 'expired';
    this.isActive = false;
  }
  // Auto-activate if startDate has arrived and status is scheduled
  else if (this.startDate && now >= this.startDate && this.status === 'scheduled') {
    this.status = 'active';
    this.isActive = true;
  }
  // Set status to active if isActive is true and status is draft
  else if (this.isActive && this.status === 'draft' && (!this.startDate || now >= this.startDate)) {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);

