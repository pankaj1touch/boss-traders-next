const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * Middleware to check if user has access to course videos
 * Allows access if:
 * 1. User is enrolled in the course, OR
 * 2. Video is marked as free preview
 * 3. Course is published
 */
const checkVideoAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    // Find course
    const course = await Course.findById(id).select('publishStatus videos');
    
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Check if course is published
    if (course.publishStatus !== 'published') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Course is not published',
      });
    }

    // If user is authenticated, check enrollment
    let hasAccess = false;
    if (userId) {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId: id,
        status: 'active',
      });
      hasAccess = !!enrollment;
    }

    // Attach access info to request
    req.courseAccess = {
      hasAccess,
      course,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check access to a specific video
 * Used when accessing individual video URLs
 */
const checkSingleVideoAccess = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user?._id;

    // Find course
    const course = await Course.findById(id).select('publishStatus videos');
    
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Check if course is published
    if (course.publishStatus !== 'published') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Course is not published',
      });
    }

    // Find the specific video
    const video = course.videos.find(
      (v) => v._id?.toString() === videoId || v.videoUrl?.includes(videoId)
    );

    if (!video) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Video not found',
      });
    }

    // Check if video is free
    if (video.isFree) {
      req.videoAccess = {
        hasAccess: true,
        video,
        course,
      };
      return next();
    }

    // If video is not free, check enrollment
    if (!userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Please enroll in the course to access this video',
      });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You need to enroll in this course to access this video',
      });
    }

    req.videoAccess = {
      hasAccess: true,
      video,
      course,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkVideoAccess,
  checkSingleVideoAccess,
};


