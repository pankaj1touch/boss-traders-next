const Banner = require('../models/Banner');
const { deleteImageFromS3 } = require('../utils/s3Upload');
const logger = require('../config/logger');

// Get all banners
exports.getAllBanners = async (req, res, next) => {
  try {
    const { isActive, sort = 'order' } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'order':
      default:
        sortObj = { order: 1, createdAt: -1 };
        break;
    }

    const banners = await Banner.find(filter).sort(sortObj);

    res.json({
      success: true,
      banners,
      count: banners.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get active banners (public endpoint)
exports.getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('title description imageUrl order');

    res.json({
      success: true,
      banners,
      count: banners.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get banner by ID
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// Create banner
exports.createBanner = async (req, res, next) => {
  try {
    const { title, description, imageUrl, isActive, order } = req.body;

    const banner = new Banner({
      title,
      description,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? order : 0,
    });

    await banner.save();

    logger.info(`Banner created: ${banner._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// Update banner
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // If imageUrl is being updated, delete old image from S3
    if (updateData.imageUrl && updateData.imageUrl !== banner.imageUrl) {
      await deleteImageFromS3(banner.imageUrl);
    }

    Object.assign(banner, updateData);
    await banner.save();

    logger.info(`Banner updated: ${banner._id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// Delete banner
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // Delete image from S3
    await deleteImageFromS3(banner.imageUrl);

    await Banner.findByIdAndDelete(id);

    logger.info(`Banner deleted: ${id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

