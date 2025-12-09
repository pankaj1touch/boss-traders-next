const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} = require('../validators/couponValidators');
const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponStats,
  getActiveCoupons,
} = require('../controllers/couponController');

// Public routes
router.get('/active', getActiveCoupons);
router.post('/validate', validate(validateCouponSchema), validateCoupon);

// Admin routes - require authentication and admin role
router.get('/admin/all', authenticate, authorize('admin'), getAllCoupons);
router.get('/admin/:id/stats', authenticate, authorize('admin'), getCouponStats);
router.get('/admin/:id', authenticate, authorize('admin'), getCouponById);
router.post(
  '/admin',
  authenticate,
  authorize('admin'),
  validate(createCouponSchema),
  createCoupon
);
router.patch(
  '/admin/:id',
  authenticate,
  authorize('admin'),
  validate(updateCouponSchema),
  updateCoupon
);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteCoupon);

// Legacy routes (for backward compatibility)
router.get('/', authenticate, authorize('admin'), getAllCoupons);
router.get('/:id', authenticate, authorize('admin'), getCouponById);

module.exports = router;

