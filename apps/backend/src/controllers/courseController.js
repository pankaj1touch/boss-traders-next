const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Feedback = require('../models/Feedback');

exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      modality,
      language,
      minPrice,
      maxPrice,
      tags,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { publishStatus: 'published' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (modality) query.modality = modality;
    if (language) query.language = language;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('instructorId', 'name avatarUrl');

    const total = await Course.countDocuments(query);

    res.json({
      courses,
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

exports.getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug, publishStatus: 'published' })
      .populate('instructorId', 'name avatarUrl');

    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Get modules and lessons
    const modules = await Module.find({ courseId: course._id }).sort('order');
    const lessons = await Lesson.find({ courseId: course._id }).sort('order');

    // Get feedback
    const feedback = await Feedback.find({ courseId: course._id, status: 'approved' })
      .populate('userId', 'name avatarUrl')
      .sort('-createdAt')
      .limit(10);

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: course._id,
        status: 'active',
      });
      isEnrolled = !!enrollment;
    }

    res.json({
      course,
      modules,
      lessons,
      feedback,
      isEnrolled,
    });
  } catch (error) {
    next(error);
  }
};

exports.enrollInCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { batchId, accessTier } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId: id });
    if (existingEnrollment) {
      return res.status(400).json({ code: 'ALREADY_ENROLLED', message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId: id,
      batchId,
      accessTier: accessTier || 'basic',
      status: 'active',
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const courseData = req.body;
    courseData.instructorId = req.user._id;

    console.log('Creating course with data:', courseData);

    const course = await Course.create(courseData);

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Course creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        code: 'VALIDATION_ERROR', 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        code: 'DUPLICATE_ERROR', 
        message: 'Course with this slug already exists' 
      });
    }
    
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Check permissions
    const isInstructor = course.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to update this course' });
    }

    Object.assign(course, updates);
    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    await Course.findByIdAndDelete(id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Admin-only endpoints
exports.adminGetAllCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      modality,
      language,
      publishStatus,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (modality) query.modality = modality;
    if (language) query.language = language;
    if (publishStatus) query.publishStatus = publishStatus;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('instructorId', 'name email avatarUrl');

    const total = await Course.countDocuments(query);

    res.json({
      courses,
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

exports.adminGetCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructorId', 'name email avatarUrl');

    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Get modules and lessons
    const modules = await Module.find({ courseId: course._id }).sort('order');
    const lessons = await Lesson.find({ courseId: course._id }).sort('order');

    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });

    res.json({
      course,
      modules,
      lessons,
      enrollmentCount,
    });
  } catch (error) {
    next(error);
  }
};

