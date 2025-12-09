const Order = require('../models/Order');
const Course = require('../models/Course');
const Ebook = require('../models/Ebook');
const Coupon = require('../models/Coupon');
const Enrollment = require('../models/Enrollment');
const { DemoClassRegistration } = require('../models/DemoClass');
const { generateOrderNumber } = require('../utils/orderNumber');
const { sendOrderConfirmationEmail } = require('../utils/emailjs');
const { generateUPIString, generateQRCode } = require('../utils/qrCode');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, couponCode } = req.body;
    const userId = req.user._id;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (item.courseId) {
        const course = await Course.findById(item.courseId);
        if (!course) {
          return res.status(404).json({ code: 'NOT_FOUND', message: `Course ${item.courseId} not found` });
        }
        const price = course.salePrice || course.price;
        subtotal += price;
        orderItems.push({
          courseId: course._id,
          title: course.title,
          price,
          quantity: 1,
        });
      } else if (item.ebookId) {
        const ebook = await Ebook.findById(item.ebookId);
        if (!ebook) {
          return res.status(404).json({ code: 'NOT_FOUND', message: `Ebook ${item.ebookId} not found` });
        }
        const price = ebook.salePrice || ebook.price;
        subtotal += price;
        orderItems.push({
          ebookId: ebook._id,
          title: ebook.title,
          price,
          quantity: 1,
        });
      }
    }

    const tax = subtotal * 0.1; // 10% tax
    
    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    let discountType = null;
    
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      
      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid = 
          (!coupon.endDate || now <= coupon.endDate) &&
          (!coupon.startDate || now >= coupon.startDate) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          !coupon.hasExceededUserLimit(userId) &&
          subtotal >= coupon.minPurchaseAmount;
        
        if (isValid) {
          // Check applicable items
          let isApplicable = true;
          if (coupon.applicableTo !== 'all') {
            const applicableTypes = {
              courses: 'course',
              ebooks: 'ebook',
              'demo-classes': 'demo-class',
            };
            const requiredType = applicableTypes[coupon.applicableTo];
            isApplicable = orderItems.some((item) => {
              if (requiredType === 'course' && item.courseId) return true;
              if (requiredType === 'ebook' && item.ebookId) return true;
              if (requiredType === 'demo-class' && item.demoClassId) return true;
              return false;
            });
            
            // Check specific items if applicable
            if (isApplicable && coupon.applicableTo === 'specific' && coupon.specificItems.length > 0) {
              const itemIds = orderItems.map((item) => 
                item.courseId?.toString() || item.ebookId?.toString() || item.demoClassId?.toString()
              );
              isApplicable = coupon.specificItems.some((itemId) => 
                itemIds.includes(itemId.toString())
              );
            }
          }
          
          if (isApplicable) {
            discount = coupon.calculateDiscount(subtotal);
            discountType = 'coupon';
            
            // Update coupon usage
            coupon.usageCount += 1;
            coupon.usedBy.push({
              userId: userId,
              orderId: null, // Will update after order creation
              usedAt: new Date(),
              usageCount: 1,
            });
          }
        }
      }
    }
    
    const total = Math.max(0, subtotal + tax - discount);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Generate UPI string and QR code
    const upiString = generateUPIString(total, orderNumber);
    const qrCodeImage = await generateQRCode(upiString);

    const order = await Order.create({
      userId,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      discount,
      couponCode: coupon ? coupon.code : null,
      couponId: coupon ? coupon._id : null,
      discountType,
      total,
      currency: 'INR',
      status: 'pending',
      qrCodeData: upiString,
      qrCodeImageUrl: qrCodeImage,
      upiId: process.env.UPI_ID || 'Not configured',
    });
    
    // Update coupon with order ID if coupon was applied
    if (coupon && discount > 0) {
      const lastUsage = coupon.usedBy[coupon.usedBy.length - 1];
      if (lastUsage) {
        lastUsage.orderId = order._id;
      }
      await coupon.save();
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    next(error);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized' });
    }

    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      order.status = 'completed';
      order.paymentMethod = paymentMethod;
      order.paymentId = `PAY-${Date.now()}`;
      await order.save();

      // Create enrollments for courses
      for (const item of order.items) {
        if (item.courseId) {
          await Enrollment.findOneAndUpdate(
            { userId: order.userId, courseId: item.courseId },
            {
              userId: order.userId,
              courseId: item.courseId,
              accessTier: 'basic',
              status: 'active',
            },
            { upsert: true, new: true }
          );
        }
      }

      // Update demo class registration payment status if order is for demo class
      const demoClassRegistration = await DemoClassRegistration.findOne({ orderId: order._id });
      if (demoClassRegistration) {
        demoClassRegistration.paymentStatus = 'completed';
        await demoClassRegistration.save();
      }

      // Send confirmation email
      await sendOrderConfirmationEmail(req.user, order);

      res.json({ message: 'Payment successful', order });
    } else {
      order.status = 'failed';
      await order.save();
      res.status(400).json({ code: 'PAYMENT_FAILED', message: 'Payment processing failed' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).sort('-createdAt');

    // For each order, check if it has demo class items and get registration status
    const ordersWithRegistrationStatus = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Check if order has demo class items
        const demoClassItems = order.items.filter(item => item.demoClassId);
        
        if (demoClassItems.length > 0) {
          // Get registration status for demo class orders
          const registrations = await DemoClassRegistration.find({
            userId,
            orderId: order._id,
          }).select('approvalStatus paymentStatus demoClassId');
          
          // Add registration info to order
          orderObj.demoClassRegistrations = registrations.map(reg => ({
            demoClassId: reg.demoClassId,
            approvalStatus: reg.approvalStatus,
            paymentStatus: reg.paymentStatus,
          }));
        }
        
        return orderObj;
      })
    );

    res.json({ orders: ordersWithRegistrationStatus });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

// Admin: list all orders with optional filters
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { orderNumber: regex },
        { paymentId: regex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment - User submits payment details (Auto-enrollment enabled)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId, screenshot } = req.body;
    
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' });
    }

    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized' });
    }

    // Store payment proof and mark as completed
    order.paymentId = transactionId;
    order.paymentScreenshot = screenshot || '';
    order.status = 'completed'; // Automatically mark as completed
    order.paymentMethod = 'upi';
    order.paymentVerified = true; // Auto-verified
    await order.save();

    // Create enrollments immediately for all courses
    for (const item of order.items) {
      if (item.courseId) {
        await Enrollment.findOneAndUpdate(
          { userId: order.userId._id, courseId: item.courseId },
          {
            userId: order.userId._id,
            courseId: item.courseId,
            accessTier: 'basic',
            status: 'active',
          },
          { upsert: true, new: true }
        );
      }
    }

    // Update demo class registration payment status if order is for demo class
    const demoClassRegistration = await DemoClassRegistration.findOne({ orderId: order._id });
    if (demoClassRegistration) {
      demoClassRegistration.paymentStatus = 'completed';
      await demoClassRegistration.save();
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order.userId, order);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.json({ 
      message: 'Payment successful! Course activated. You can start learning now.', 
      order 
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment - Admin verifies and confirms payment
exports.confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found' });
    }

    order.status = 'completed';
    order.paymentVerified = true;
    await order.save();

    // Create enrollments for courses
    for (const item of order.items) {
      if (item.courseId) {
        await Enrollment.findOneAndUpdate(
          { userId: order.userId._id, courseId: item.courseId },
          {
            userId: order.userId._id,
            courseId: item.courseId,
            accessTier: 'basic',
            status: 'active',
          },
          { upsert: true, new: true }
        );
      }
    }

    // Update demo class registration payment status if order is for demo class
    const demoClassRegistration = await DemoClassRegistration.findOne({ orderId: order._id });
    if (demoClassRegistration) {
      demoClassRegistration.paymentStatus = 'completed';
      await demoClassRegistration.save();
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order.userId, order);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.json({ message: 'Payment confirmed successfully', order });
  } catch (error) {
    next(error);
  }
};

