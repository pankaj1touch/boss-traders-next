const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      unique: true,
      enum: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'telegram', 'whatsapp'],
      lowercase: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

socialLinkSchema.index({ platform: 1 });
socialLinkSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('SocialLink', socialLinkSchema);

