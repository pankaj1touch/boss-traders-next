const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 20,
      match: /^[A-Z0-9]+$/, // Only uppercase letters and numbers
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Only for percentage type
      min: 0,
    },
    applicableTo: {
      type: String,
      enum: ['all', 'courses', 'ebooks', 'demo-classes', 'specific'],
      default: 'all',
    },
    specificItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType',
      },
    ],
    itemType: {
      type: String,
      enum: ['Course', 'Ebook', 'DemoClass'],
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        usageCount: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for better query performance
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, endDate: 1 });
couponSchema.index({ applicableTo: 1 });
couponSchema.index({ createdAt: -1 });

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function () {
  const now = new Date();
  if (this.endDate && now > this.endDate) {
    return true;
  }
  if (this.startDate && now < this.startDate) {
    return false; // Not started yet
  }
  return false;
});

// Virtual to check if coupon is valid (not expired, active, within usage limit)
couponSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.isExpired) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  return true;
});

// Pre-save middleware to ensure code is uppercase
couponSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase().trim();
  }
  next();
});

// Method to check if user has exceeded user limit
couponSchema.methods.hasExceededUserLimit = function (userId) {
  const userUsage = this.usedBy.filter(
    (usage) => usage.userId.toString() === userId.toString()
  );
  const totalUserUsage = userUsage.reduce((sum, usage) => sum + usage.usageCount, 0);
  return totalUserUsage >= this.userLimit;
};

// Method to get user usage count
couponSchema.methods.getUserUsageCount = function (userId) {
  const userUsage = this.usedBy.filter(
    (usage) => usage.userId.toString() === userId.toString()
  );
  return userUsage.reduce((sum, usage) => sum + usage.usageCount, 0);
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (cartTotal) {
  if (this.type === 'percentage') {
    const discount = (cartTotal * this.value) / 100;
    if (this.maxDiscountAmount) {
      return Math.min(discount, this.maxDiscountAmount);
    }
    return discount;
  } else {
    // Fixed discount
    return Math.min(this.value, cartTotal);
  }
};

module.exports = mongoose.model('Coupon', couponSchema);

