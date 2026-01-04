const SocialLink = require('../models/SocialLink');

// Get all active social links (public)
const getActiveSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true })
      .sort({ order: 1 });

    res.json({
      success: true,
      socialLinks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching social links',
      error: error.message,
    });
  }
};

// Admin: Get all social links
const adminGetAllSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.find()
      .populate('lastUpdatedBy', 'name email')
      .sort({ order: 1 });

    res.json({
      success: true,
      socialLinks,
      count: socialLinks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching social links',
      error: error.message,
    });
  }
};

// Admin: Create social link
const createSocialLink = async (req, res) => {
  try {
    const { platform, url, isActive, order } = req.body;

    const existing = await SocialLink.findOne({ platform: platform.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Social link for "${platform}" already exists. Please update instead.`,
      });
    }

    const socialLink = new SocialLink({
      platform: platform.toLowerCase(),
      url,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      lastUpdatedBy: req.user.id,
    });

    await socialLink.save();

    res.status(201).json({
      success: true,
      message: 'Social link created successfully',
      socialLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating social link',
      error: error.message,
    });
  }
};

// Admin: Update social link
const updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, isActive, order } = req.body;

    const socialLink = await SocialLink.findById(id);
    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    if (url !== undefined) socialLink.url = url;
    if (isActive !== undefined) socialLink.isActive = isActive;
    if (order !== undefined) socialLink.order = order;
    socialLink.lastUpdatedBy = req.user.id;

    await socialLink.save();

    res.json({
      success: true,
      message: 'Social link updated successfully',
      socialLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating social link',
      error: error.message,
    });
  }
};

// Admin: Delete social link
const deleteSocialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const socialLink = await SocialLink.findByIdAndDelete(id);

    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    res.json({
      success: true,
      message: 'Social link deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting social link',
      error: error.message,
    });
  }
};

module.exports = {
  getActiveSocialLinks,
  adminGetAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
};

