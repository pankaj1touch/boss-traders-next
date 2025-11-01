const Ebook = require('../models/Ebook');
const Order = require('../models/Order');
const { generateSignedUrl } = require('../utils/signedUrl');

exports.getAllEbooks = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const query = { publishStatus: 'published' };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const ebooks = await Ebook.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Ebook.countDocuments(query);

    res.json({
      ebooks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getEbookBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const ebook = await Ebook.findOne({ slug, publishStatus: 'published' });

    if (!ebook) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ebook not found' });
    }

    res.json({ ebook });
  } catch (error) {
    next(error);
  }
};

exports.downloadEbook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ebook = await Ebook.findById(id);

    if (!ebook) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ebook not found' });
    }

    // Check if user has purchased the ebook
    const order = await Order.findOne({
      userId,
      'items.ebookId': id,
      status: 'completed',
    });

    if (!order) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Ebook not purchased' });
    }

    // Generate signed download URL
    const { url, expiresAt } = generateSignedUrl(ebook.fileUrl, 3600); // 1 hour expiry

    res.json({
      downloadUrl: url,
      expiresAt,
      ebook: {
        title: ebook.title,
        author: ebook.author,
        format: ebook.format,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createEbook = async (req, res, next) => {
  try {
    const ebookData = req.body;

    const ebook = await Ebook.create(ebookData);

    res.status(201).json({ message: 'Ebook created successfully', ebook });
  } catch (error) {
    next(error);
  }
};

exports.updateEbook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ebook = await Ebook.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!ebook) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ebook not found' });
    }

    res.json({ message: 'Ebook updated successfully', ebook });
  } catch (error) {
    next(error);
  }
};

exports.deleteEbook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ebook = await Ebook.findByIdAndDelete(id);

    if (!ebook) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ebook not found' });
    }

    res.json({ message: 'Ebook deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Admin-only endpoints
exports.adminGetAllEbooks = async (req, res, next) => {
  try {
    const { 
      category, 
      publishStatus, 
      search, 
      page = 1, 
      limit = 20, 
      sort = '-createdAt' 
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (publishStatus) query.publishStatus = publishStatus;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const ebooks = await Ebook.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Ebook.countDocuments(query);

    res.json({
      ebooks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.adminGetEbookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ebook = await Ebook.findById(id);

    if (!ebook) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Ebook not found' });
    }

    // Get purchase count
    const purchaseCount = await Order.countDocuments({
      'items.ebookId': id,
      status: 'completed',
    });

    res.json({
      ebook,
      purchaseCount,
    });
  } catch (error) {
    next(error);
  }
};

