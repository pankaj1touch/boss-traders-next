const Blog = require('../models/Blog');
const { createSlug } = require('../utils/slugHelper');

// Get all published blogs with filtering and pagination
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      featured,
      search,
      sort = 'newest'
    } = req.query;

    // Build filter object
    const filter = { publishStatus: 'published' };

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (featured !== undefined && featured !== null && featured !== '') {
      filter.featured = featured === 'true' || featured === true;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'oldest':
        sortObj = { publishedAt: 1 };
        break;
      case 'popular':
        sortObj = { views: -1 };
        break;
      case 'featured':
        sortObj = { featured: -1, publishedAt: -1 };
        break;
      default:
        sortObj = { publishedAt: -1 };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const blogs = await Blog.find(filter)
      .populate('author', 'name email avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Handle cases where author might be null and calculate readingTime, then remove content
    const blogsWithAuthor = blogs.map(blog => {
      try {
        const blogObj = blog.toObject ? blog.toObject() : blog;
        const readingTime = blogObj.content && typeof blogObj.content === 'string' 
          ? Math.ceil(blogObj.content.split(/\s+/).length / 200) 
          : 5;
        
        // Remove content from response but keep everything else
        const { content, ...blogWithoutContent } = blogObj;
        
        return {
          ...blogWithoutContent,
          author: blogObj.author || { name: 'Unknown Author', email: '', avatar: '' },
          readingTime
        };
      } catch (err) {
        console.error('Error processing blog:', err);
        return {
          ...blog,
          author: blog.author || { name: 'Unknown Author', email: '', avatar: '' },
          readingTime: 5
        };
      }
    });

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      blogs: blogsWithAuthor,
      pagination: {
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, publishStatus: 'published' })
      .populate('author', 'name email avatar bio');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Get related blogs
const getRelatedBlogs = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    const currentBlog = await Blog.findOne({ slug });
    if (!currentBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlog._id },
      category: currentBlog.category,
      publishStatus: 'published'
    })
      .populate('author', 'name avatar')
      .select('-content')
      .limit(parseInt(limit));

    res.json({
      success: true,
      blogs: relatedBlogs
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related blogs',
      error: error.message
    });
  }
};

// Admin: Get all blogs (including drafts)
const adminGetAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      publishStatus,
      featured,
      search
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (publishStatus) filter.publishStatus = publishStatus;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      blogs,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Admin: Get blog by ID
const adminGetBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('author', 'name email avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Admin: Create blog
const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    blogData.author = req.user.id;

    // Generate slug from title
    blogData.slug = createSlug(blogData.title);

    // Set published date if status is published
    if (blogData.publishStatus === 'published') {
      blogData.publishedAt = new Date();
    }

    const blog = new Blog(blogData);
    await blog.save();

    await blog.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// Admin: Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get current blog to check for changes
    const currentBlog = await Blog.findById(id);
    if (!currentBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Generate new slug if title is being updated
    if (updateData.title && currentBlog.title !== updateData.title) {
      updateData.slug = createSlug(updateData.title);
    }

    // Set published date if status is being changed to published and it wasn't already published
    if (updateData.publishStatus === 'published' && !currentBlog.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// Admin: Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  adminGetAllBlogs,
  adminGetBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
