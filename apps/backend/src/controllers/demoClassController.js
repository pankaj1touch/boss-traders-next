const { DemoClass, DemoClassRegistration } = require('../models/DemoClass');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateOrderNumber } = require('../utils/orderNumber');
const { generateUPIString, generateQRCode } = require('../utils/qrCode');
const { emitToUser, emitToAdmins } = require('../socket/socketServer');

// Get all demo classes
exports.getAllDemoClasses = async (req, res, next) => {
  try {
    const { courseId, status, startDate, endDate } = req.query;

    const query = { status: { $ne: 'cancelled' } };
    if (courseId) query.courseId = courseId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const demoClasses = await DemoClass.find(query)
      .populate('courseId', 'title thumbnail slug')
      .populate('batchId', 'name')
      .populate('locationId', 'name address city')
      .populate('instructorId', 'name email')
      .sort('scheduledAt');

    res.json({ demoClasses });
  } catch (error) {
    next(error);
  }
};

// Get demo class by ID
exports.getDemoClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const demoClass = await DemoClass.findById(id)
      .populate('courseId', 'title thumbnail slug description')
      .populate('batchId', 'name')
      .populate('locationId', 'name address city')
      .populate('instructorId', 'name email');

    if (!demoClass) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Demo class not found' });
    }

    // Check if user is registered (if authenticated)
    let isRegistered = false;
    if (req.user) {
      const registration = await DemoClassRegistration.findOne({
        demoClassId: id,
        userId: req.user._id,
      });
      isRegistered = !!registration;
    }

    res.json({ demoClass, isRegistered });
  } catch (error) {
    next(error);
  }
};

// Register for demo class
exports.registerForDemoClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, notes } = req.body;
    const userId = req.user._id; // Now required since route uses authenticate middleware

    const demoClass = await DemoClass.findById(id);
    if (!demoClass) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Demo class not found' });
    }

    if (demoClass.status !== 'scheduled') {
      return res.status(400).json({ code: 'INVALID_STATUS', message: 'Demo class is not available for registration' });
    }

    if (demoClass.registeredCount >= demoClass.maxAttendees) {
      return res.status(400).json({ code: 'FULL', message: 'Demo class is full' });
    }

    // Check if already registered
    const existingRegistration = await DemoClassRegistration.findOne({
      demoClassId: id,
      userId,
    });

    if (existingRegistration) {
      return res.status(400).json({ code: 'ALREADY_REGISTERED', message: 'You are already registered for this demo class' });
    }

    // Create payment order if demo class has a price
    let order = null;
    if (demoClass.price > 0) {
      const orderNumber = generateOrderNumber();
      const tax = demoClass.price * 0.1; // 10% tax
      const total = demoClass.price + tax;

      // Generate UPI string and QR code
      const upiString = generateUPIString(total, orderNumber);
      const qrCodeImage = await generateQRCode(upiString);

      order = await Order.create({
        userId,
        orderNumber,
        items: [
          {
            demoClassId: demoClass._id,
            title: `Demo Class: ${demoClass.title}`,
            price: demoClass.price,
            quantity: 1,
          },
        ],
        subtotal: demoClass.price,
        tax,
        total,
        currency: 'INR',
        status: 'pending',
        qrCodeData: upiString,
        qrCodeImageUrl: qrCodeImage,
        upiId: process.env.UPI_ID || 'Not configured',
      });
    }

    // Create registration with pending approval
    const registration = await DemoClassRegistration.create({
      demoClassId: id,
      userId,
      name,
      email,
      phone,
      notes,
      status: 'registered',
      approvalStatus: 'pending',
      orderId: order ? order._id : null,
      paymentStatus: demoClass.price > 0 ? 'pending' : 'completed',
    });

    // Don't update registered count yet - wait for admin approval
    // demoClass.registeredCount += 1;
    // await demoClass.save();

    // Send notification to all admins about new registration
    try {
      const admins = await User.find({ roles: 'admin' }).select('_id');
      const notifications = admins.map(admin => ({
        userId: admin._id,
        type: 'demo_class_registration',
        channel: 'inapp',
        payload: {
          title: 'New Demo Class Registration',
          message: `${name} has registered for "${demoClass.title}". Payment status: ${demoClass.price > 0 ? 'Pending' : 'Free'}`,
          link: `/admin/demo-classes/registrations`,
          data: {
            registrationId: registration._id,
            demoClassId: demoClass._id,
            demoClassTitle: demoClass.title,
            userName: name,
            userEmail: email,
          },
        },
        status: 'sent',
        sentAt: new Date(),
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        
        // Emit Socket.IO event to all admins
        emitToAdmins('demo_class:new_registration', {
          registrationId: registration._id,
          demoClassId: demoClass._id,
          demoClassTitle: demoClass.title,
          userName: name,
          userEmail: email,
          paymentStatus: demoClass.price > 0 ? 'pending' : 'completed',
          createdAt: registration.createdAt,
        });
      }
    } catch (notificationError) {
      // Don't fail registration if notification fails
      console.error('Failed to send admin notifications:', notificationError);
    }

    res.status(201).json({
      message: demoClass.price > 0
        ? 'Registration submitted. Please complete payment to proceed.'
        : 'Registration submitted. Waiting for admin approval.',
      registration,
      order: order || null,
      requiresPayment: demoClass.price > 0,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's demo class registrations
exports.getUserRegistrations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const registrations = await DemoClassRegistration.find({ userId })
      .populate({
        path: 'demoClassId',
        populate: [
          { path: 'courseId', select: 'title thumbnail slug' },
          { path: 'instructorId', select: 'name email' },
          { path: 'locationId', select: 'name address city' },
        ],
      })
      .sort('-createdAt');

    res.json({ registrations });
  } catch (error) {
    next(error);
  }
};

// Create demo class (admin/instructor)
exports.createDemoClass = async (req, res, next) => {
  try {
    const demoClassData = req.body;
    demoClassData.instructorId = demoClassData.instructorId || req.user._id;

    // Handle empty strings for optional fields
    if (demoClassData.locationId === '' || demoClassData.locationId === null) {
      delete demoClassData.locationId;
    }
    if (demoClassData.batchId === '' || demoClassData.batchId === null) {
      delete demoClassData.batchId;
    }
    if (demoClassData.meetingLink === '' || demoClassData.meetingLink === null) {
      delete demoClassData.meetingLink;
    }

    // Set default price if not provided
    if (demoClassData.price === undefined || demoClassData.price === null || demoClassData.price === '') {
      demoClassData.price = 0;
    } else {
      demoClassData.price = Number(demoClassData.price);
    }

    // Validate course exists
    if (demoClassData.courseId) {
      const course = await Course.findById(demoClassData.courseId);
      if (!course) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
      }
    }

    const demoClass = await DemoClass.create(demoClassData);

    res.status(201).json({ message: 'Demo class created successfully', demoClass });
  } catch (error) {
    next(error);
  }
};

// Update demo class (admin/instructor)
exports.updateDemoClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle empty strings for optional fields
    if (updates.locationId === '' || updates.locationId === null) {
      updates.locationId = undefined;
    }
    if (updates.batchId === '' || updates.batchId === null) {
      updates.batchId = undefined;
    }
    if (updates.meetingLink === '' || updates.meetingLink === null) {
      updates.meetingLink = undefined;
    }

    const demoClass = await DemoClass.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!demoClass) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Demo class not found' });
    }

    res.json({ message: 'Demo class updated successfully', demoClass });
  } catch (error) {
    next(error);
  }
};

// Delete demo class (admin)
exports.deleteDemoClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const demoClass = await DemoClass.findByIdAndDelete(id);

    if (!demoClass) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Demo class not found' });
    }

    // Delete all registrations
    await DemoClassRegistration.deleteMany({ demoClassId: id });

    res.json({ message: 'Demo class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const registration = await DemoClassRegistration.findOne({
      demoClassId: id,
      userId,
    });

    if (!registration) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Registration not found' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ code: 'ALREADY_CANCELLED', message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update registered count
    const demoClass = await DemoClass.findById(id);
    if (demoClass && demoClass.registeredCount > 0) {
      demoClass.registeredCount -= 1;
      await demoClass.save();
    }

    res.json({ message: 'Registration cancelled successfully', registration });
  } catch (error) {
    next(error);
  }
};

// Get all registrations (admin)
exports.getPendingRegistrations = async (req, res, next) => {
  try {
    const { demoClassId, status, approvalStatus } = req.query;

    const query = {};
    if (demoClassId) query.demoClassId = demoClassId;
    if (status) query.paymentStatus = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    // If no approvalStatus filter, show all (pending, approved, rejected)

    const registrations = await DemoClassRegistration.find(query)
      .populate({
        path: 'demoClassId',
        populate: [
          { path: 'courseId', select: 'title thumbnail slug' },
          { path: 'instructorId', select: 'name email' },
        ],
      })
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber total status paymentVerified')
      .sort('-createdAt');

    res.json({ registrations });
  } catch (error) {
    next(error);
  }
};

// Approve registration (admin)
exports.approveRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const registration = await DemoClassRegistration.findById(id)
      .populate('demoClassId')
      .populate('orderId');

    if (!registration) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Registration not found' });
    }

    if (registration.approvalStatus === 'approved') {
      return res.status(400).json({ code: 'ALREADY_APPROVED', message: 'Registration is already approved' });
    }

    // Check if payment is completed (if required)
    if (registration.orderId && registration.paymentStatus !== 'completed') {
      const order = registration.orderId;
      if (order.status !== 'completed' && !order.paymentVerified) {
        return res.status(400).json({
          code: 'PAYMENT_PENDING',
          message: 'Cannot approve registration. Payment is not completed.',
        });
      }
      registration.paymentStatus = 'completed';
    }

    registration.approvalStatus = 'approved';
    if (adminNotes) registration.adminNotes = adminNotes;
    await registration.save();

    // Update registered count
    const demoClass = registration.demoClassId;
    if (demoClass) {
      demoClass.registeredCount += 1;
      await demoClass.save();
    }

    // Emit Socket.IO event to the user
    emitToUser(registration.userId.toString(), 'demo_class:registration_approved', {
      registrationId: registration._id,
      demoClassId: demoClass._id,
      demoClassTitle: demoClass.title,
      approvalStatus: 'approved',
      adminNotes: registration.adminNotes,
    });

    res.json({ message: 'Registration approved successfully', registration });
  } catch (error) {
    next(error);
  }
};

// Reject registration (admin)
exports.rejectRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const registration = await DemoClassRegistration.findById(id)
      .populate('demoClassId');

    if (!registration) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Registration not found' });
    }

    if (registration.approvalStatus === 'rejected') {
      return res.status(400).json({ code: 'ALREADY_REJECTED', message: 'Registration is already rejected' });
    }

    registration.approvalStatus = 'rejected';
    if (adminNotes) registration.adminNotes = adminNotes;
    await registration.save();

    // Emit Socket.IO event to the user
    const demoClass = await DemoClass.findById(registration.demoClassId);
    emitToUser(registration.userId.toString(), 'demo_class:registration_rejected', {
      registrationId: registration._id,
      demoClassId: registration.demoClassId,
      demoClassTitle: demoClass?.title || 'Demo Class',
      approvalStatus: 'rejected',
      adminNotes: registration.adminNotes,
    });

    res.json({ message: 'Registration rejected successfully', registration });
  } catch (error) {
    next(error);
  }
};

// Get demo class registration statistics (admin)
exports.getRegistrationStats = async (req, res, next) => {
  try {
    const totalRegistrations = await DemoClassRegistration.countDocuments();
    const pendingRegistrations = await DemoClassRegistration.countDocuments({ approvalStatus: 'pending' });
    const approvedRegistrations = await DemoClassRegistration.countDocuments({ approvalStatus: 'approved' });
    const rejectedRegistrations = await DemoClassRegistration.countDocuments({ approvalStatus: 'rejected' });
    const totalDemoClasses = await DemoClass.countDocuments();

    res.json({
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      totalDemoClasses,
    });
  } catch (error) {
    next(error);
  }
};

