const Announcement = require('../models/Announcement');
const logger = require('../config/logger');

// Get all announcements (Admin only - with filters)
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { status, type, priority, isActive, sort = 'newest' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'priority':
        sortObj = { createdAt: -1 }; // Will sort by priority in memory
        break;
      case 'views':
        sortObj = { views: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    let announcements = await Announcement.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortObj)
      .lean(); // Convert to plain JS objects for sorting

    // Custom sort for priority (high > medium > low)
    if (sort === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      announcements = announcements.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      announcements,
      count: announcements.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get active announcements (Public endpoint)
exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const { type, priority, audience } = req.query;
    const now = new Date();

    const filter = {
      isActive: true,
      status: { $in: ['active', 'scheduled'] },
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (audience && audience !== 'all') {
      filter.$and.push({
        $or: [
          { audience: 'all' },
          { audience: audience },
        ],
      });
    }

    const announcements = await Announcement.find(filter)
      .select('title description body type priority imageUrl linkUrl linkText createdAt')
      .sort({ priority: -1, createdAt: -1 }); // High priority first

    res.json({
      success: true,
      announcements,
      count: announcements.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get announcement by ID (Admin)
exports.getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id).populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// Create announcement (Admin)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const announcementData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // If status is not provided and isActive is true, set status to active
    if (!announcementData.status && announcementData.isActive) {
      const now = new Date();
      if (announcementData.startDate && now < announcementData.startDate) {
        announcementData.status = 'scheduled';
      } else {
        announcementData.status = 'active';
      }
    }

    const announcement = await Announcement.create(announcementData);

    logger.info(`Announcement created: ${announcement._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// Update announcement (Admin)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Update status based on dates if not explicitly set
    if (updateData.isActive !== undefined || updateData.startDate !== undefined || updateData.endDate !== undefined) {
      const now = new Date();
      const startDate = updateData.startDate ? new Date(updateData.startDate) : announcement.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : announcement.endDate;
      const isActive = updateData.isActive !== undefined ? updateData.isActive : announcement.isActive;

      if (endDate && now > endDate) {
        updateData.status = 'expired';
        updateData.isActive = false;
      } else if (startDate && now >= startDate && isActive) {
        updateData.status = 'active';
      }
    }

    Object.assign(announcement, updateData);
    await announcement.save();

    logger.info(`Announcement updated: ${announcement._id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// Delete announcement (Admin)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(id);

    logger.info(`Announcement deleted: ${id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Track announcement view (Public)
exports.trackView = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    announcement.views += 1;
    await announcement.save();

    res.json({
      success: true,
      message: 'View tracked',
    });
  } catch (error) {
    next(error);
  }
};

// Track announcement click (Public)
exports.trackClick = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    announcement.clicks += 1;
    await announcement.save();

    res.json({
      success: true,
      message: 'Click tracked',
    });
  } catch (error) {
    next(error);
  }
};

