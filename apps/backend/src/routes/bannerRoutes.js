const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createBannerSchema,
  updateBannerSchema,
} = require('../validators/bannerValidators');
const {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

// Public route - Get active banners
router.get('/active', getActiveBanners);

// Admin routes - require authentication and admin role
router.get('/', authenticate, authorize('admin'), getAllBanners);
router.get('/:id', authenticate, authorize('admin'), getBannerById);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createBannerSchema),
  createBanner
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateBannerSchema),
  updateBanner
);
router.delete('/:id', authenticate, authorize('admin'), deleteBanner);

module.exports = router;

