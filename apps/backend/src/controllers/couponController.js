const Coupon = require('../models/Coupon');
const Course = require('../models/Course');
const Ebook = require('../models/Ebook');
const logger = require('../config/logger');

// Get active coupons (Public)
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find active coupons that are not expired
    const coupons = await Coupon.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $lte: now } },
            { startDate: null }
          ]
        },
        {
          $or: [
            { endDate: { $gte: now } },
            { endDate: null }
          ]
        }
      ]
    })
      .select('code type value minPurchaseAmount maxDiscountAmount applicableTo description endDate usageLimit usageCount')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Filter out coupons that have reached usage limit
    const validCoupons = coupons.filter(coupon => {
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return false;
      }
      return true;
    });

    res.json({
      success: true,
      coupons: validCoupons,
      count: validCoupons.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const { isActive, type, applicableTo, sort = 'newest' } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;
    if (applicableTo) filter.applicableTo = applicableTo;

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'code':
        sortObj = { code: 1 };
        break;
      case 'usage':
        sortObj = { usageCount: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortObj);

    res.json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon by ID (Admin)
exports.getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id).populate('createdBy', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Create coupon (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Ensure code is uppercase
    if (couponData.code) {
      couponData.code = couponData.code.toUpperCase().trim();
    }

    const coupon = await Coupon.create(couponData);

    logger.info(`Coupon created: ${coupon.code} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }
    next(error);
  }
};

// Update coupon (Admin)
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure code is uppercase if being updated
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    logger.info(`Coupon updated: ${coupon.code} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }
    next(error);
  }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    logger.info(`Coupon deleted: ${id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Validate coupon (Public)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, items, userId } = req.body;

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid coupon code',
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This coupon is not active',
      });
    }

    // Check if coupon is expired
    const now = new Date();
    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This coupon has expired',
      });
    }

    // Check if coupon has started
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This coupon is not yet active',
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This coupon has reached its usage limit',
      });
    }

    // Check user limit (if userId provided)
    if (userId && coupon.hasExceededUserLimit(userId)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'You have already used this coupon maximum times',
      });
    }

    // Calculate cart total and validate items
    let cartTotal = 0;
    const cartItems = [];

    for (const item of items) {
      if (item.courseId) {
        const course = await Course.findById(item.courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            valid: false,
            message: `Course ${item.courseId} not found`,
          });
        }
        const price = course.salePrice || course.price;
        cartTotal += price;
        cartItems.push({ type: 'course', id: course._id, price });
      } else if (item.ebookId) {
        const ebook = await Ebook.findById(item.ebookId);
        if (!ebook) {
          return res.status(404).json({
            success: false,
            valid: false,
            message: `Ebook ${item.ebookId} not found`,
          });
        }
        const price = ebook.salePrice || ebook.price;
        cartTotal += price;
        cartItems.push({ type: 'ebook', id: ebook._id, price });
      } else if (item.demoClassId) {
        // Demo class price handling (if needed)
        cartItems.push({ type: 'demo-class', id: item.demoClassId });
      }
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`,
        minPurchaseAmount: coupon.minPurchaseAmount,
        cartTotal,
      });
    }

    // Check applicable items
    if (coupon.applicableTo !== 'all') {
      const applicableTypes = {
        courses: 'course',
        ebooks: 'ebook',
        'demo-classes': 'demo-class',
      };

      const requiredType = applicableTypes[coupon.applicableTo];
      const hasApplicableItem = cartItems.some((item) => item.type === requiredType);

      if (!hasApplicableItem) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: `This coupon is only applicable to ${coupon.applicableTo}`,
        });
      }

      // Check specific items if applicableTo is 'specific'
      if (coupon.applicableTo === 'specific' && coupon.specificItems.length > 0) {
        const cartItemIds = cartItems.map((item) => item.id.toString());
        const hasSpecificItem = coupon.specificItems.some((itemId) =>
          cartItemIds.includes(itemId.toString())
        );

        if (!hasSpecificItem) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: 'This coupon is not applicable to items in your cart',
          });
        }
      }
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal);
    const finalTotal = Math.max(0, cartTotal - discount);

    res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount,
      cartTotal,
      finalTotal,
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon statistics (Admin)
exports.getCouponStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate('usedBy.userId', 'name email')
      .populate('usedBy.orderId', 'orderNumber total');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    const stats = {
      totalUsage: coupon.usageCount,
      uniqueUsers: new Set(coupon.usedBy.map((u) => u.userId?.toString())).size,
      totalRevenueSaved: coupon.usedBy.reduce((sum, usage) => {
        const order = usage.orderId;
        return sum + (order?.total || 0);
      }, 0),
      usageHistory: coupon.usedBy.slice(-10).reverse(), // Last 10 uses
    };

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        isActive: coupon.isActive,
        endDate: coupon.endDate,
      },
      stats,
    });
  } catch (error) {
    next(error);
  }
};

