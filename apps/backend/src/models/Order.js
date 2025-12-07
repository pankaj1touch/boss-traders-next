const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    items: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        ebookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ebook',
        },
        demoClassId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DemoClass',
        },
        title: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: String,
    paymentMethod: String,
    invoiceUrl: String,
    qrCodeData: String,           // UPI string or payment gateway QR data
    qrCodeImageUrl: String,        // Generated QR code image URL (base64)
    upiId: String,                 // UPI ID for payments
    paymentScreenshot: String,     // User uploaded payment proof (optional)
    paymentVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);

