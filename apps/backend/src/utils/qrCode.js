const QRCode = require('qrcode');

// Your UPI ID - environment variable से लें
const UPI_ID = process.env.UPI_ID || 'your-upi-id@paytm';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'Boss Traders';

/**
 * Generate UPI payment string
 * @param {number} amount - Payment amount
 * @param {string} orderId - Order ID/Number
 * @param {string} merchantName - Merchant name
 * @returns {string} UPI deep link string
 */
const generateUPIString = (amount, orderId, merchantName = MERCHANT_NAME) => {
  // UPI deep link format
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
};

/**
 * Generate QR Code from UPI string
 * @param {string} upiString - UPI payment string
 * @returns {Promise<string>} QR code as data URL
 */
const generateQRCode = async (upiString) => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateUPIString,
  generateQRCode,
};

