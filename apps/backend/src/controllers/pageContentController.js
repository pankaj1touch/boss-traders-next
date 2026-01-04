const PageContent = require('../models/PageContent');

// Get public page content by type
const getPageContent = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    if (!['about', 'contact', 'careers'].includes(pageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page type',
      });
    }

    const pageContent = await PageContent.findOne({
      pageType: pageType.toLowerCase(),
      isActive: true,
    });

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found',
      });
    }

    res.json({
      success: true,
      pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page content',
      error: error.message,
    });
  }
};

// Admin: Get all page contents
const adminGetAllPageContents = async (req, res) => {
  try {
    const pageContents = await PageContent.find()
      .populate('lastUpdatedBy', 'name email')
      .sort({ pageType: 1 });

    res.json({
      success: true,
      pageContents,
      count: pageContents.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page contents',
      error: error.message,
    });
  }
};

// Admin: Get page content by ID
const adminGetPageContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const pageContent = await PageContent.findById(id)
      .populate('lastUpdatedBy', 'name email');

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found',
      });
    }

    res.json({
      success: true,
      pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching page content',
      error: error.message,
    });
  }
};

// Admin: Create page content
const createPageContent = async (req, res) => {
  try {
    const { pageType, title, content, metaTitle, metaDescription, isActive } = req.body;

    // Check if page type already exists
    const existing = await PageContent.findOne({ pageType: pageType.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Page content for "${pageType}" already exists. Please update instead.`,
      });
    }

    const pageContent = new PageContent({
      pageType: pageType.toLowerCase(),
      title,
      content,
      metaTitle,
      metaDescription,
      isActive: isActive !== undefined ? isActive : true,
      lastUpdatedBy: req.user.id,
    });

    await pageContent.save();

    res.status(201).json({
      success: true,
      message: 'Page content created successfully',
      pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating page content',
      error: error.message,
    });
  }
};

// Admin: Update page content
const updatePageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, metaTitle, metaDescription, isActive } = req.body;

    const pageContent = await PageContent.findById(id);
    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found',
      });
    }

    // Update fields
    if (title !== undefined) pageContent.title = title;
    if (content !== undefined) pageContent.content = content;
    if (metaTitle !== undefined) pageContent.metaTitle = metaTitle;
    if (metaDescription !== undefined) pageContent.metaDescription = metaDescription;
    if (isActive !== undefined) pageContent.isActive = isActive;
    pageContent.lastUpdatedBy = req.user.id;

    await pageContent.save();

    res.json({
      success: true,
      message: 'Page content updated successfully',
      pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating page content',
      error: error.message,
    });
  }
};

// Admin: Delete page content
const deletePageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const pageContent = await PageContent.findByIdAndDelete(id);

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: 'Page content not found',
      });
    }

    res.json({
      success: true,
      message: 'Page content deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting page content',
      error: error.message,
    });
  }
};

module.exports = {
  getPageContent,
  adminGetAllPageContents,
  adminGetPageContentById,
  createPageContent,
  updatePageContent,
  deletePageContent,
};

