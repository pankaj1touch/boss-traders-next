const mongoose = require('mongoose');

const demoClassSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // duration in minutes
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxAttendees: {
      type: Number,
      default: 20,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    meetingLink: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

const demoClassRegistrationSchema = new mongoose.Schema(
  {
    demoClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DemoClass',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    notes: String,
    adminNotes: String, // Admin can add notes when approving/rejecting
  },
  { timestamps: true }
);

demoClassSchema.index({ courseId: 1, scheduledAt: 1 });
demoClassSchema.index({ status: 1, scheduledAt: 1 });
demoClassRegistrationSchema.index({ demoClassId: 1, userId: 1 }, { unique: true });
demoClassRegistrationSchema.index({ userId: 1 });

const DemoClass = mongoose.model('DemoClass', demoClassSchema);
const DemoClassRegistration = mongoose.model('DemoClassRegistration', demoClassRegistrationSchema);

module.exports = { DemoClass, DemoClassRegistration };

