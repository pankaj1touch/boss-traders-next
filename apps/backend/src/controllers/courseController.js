const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Feedback = require('../models/Feedback');
const VideoAnalytics = require('../models/VideoAnalytics');
const VideoComment = require('../models/VideoComment');
const VideoNote = require('../models/VideoNote');
const VideoFavorite = require('../models/VideoFavorite');
const VideoRating = require('../models/VideoRating');
const VideoSubtitle = require('../models/VideoSubtitle');
const VideoTranscription = require('../models/VideoTranscription');
const LiveStream = require('../models/LiveStream');
const LiveStreamChat = require('../models/LiveStreamChat');
const Notification = require('../models/Notification');
const VideoAnnotation = require('../models/VideoAnnotation');
const CourseDiscussion = require('../models/CourseDiscussion');
const { getSignedVideoUrl } = require('../utils/s3Upload');
const config = require('../config/env');

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

    // Validate video URLs if videos are provided
    if (courseData.videos && Array.isArray(courseData.videos)) {
      for (const video of courseData.videos) {
        if (!video.videoUrl || typeof video.videoUrl !== 'string') {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Each video must have a valid videoUrl',
          });
        }

        // Basic URL validation
        try {
          new URL(video.videoUrl);
        } catch (e) {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: `Invalid video URL: ${video.videoUrl}`,
          });
        }
      }
    }

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

    // Validate videos if provided
    if (updates.videos && Array.isArray(updates.videos)) {
      for (const video of updates.videos) {
        if (!video.title || !video.videoUrl) {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Each video must have a title and videoUrl',
          });
        }

        // Validate video URL format
        if (typeof video.videoUrl !== 'string' || video.videoUrl.trim() === '') {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Video URL must be a valid string',
          });
        }

        // Basic URL validation
        try {
          new URL(video.videoUrl);
        } catch (e) {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: `Invalid video URL: ${video.videoUrl}`,
          });
        }

        // Ensure order is set
        if (video.order === undefined) {
          video.order = 0;
        }
        // Ensure duration is a number
        if (video.duration === undefined) {
          video.duration = 0;
        }
      }
    }

    Object.assign(course, updates);
    // totalDuration will be calculated automatically by pre-save hook
    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: validationErrors,
      });
    }
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

// Get video analytics for a course
exports.getVideoAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select('videos');
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Get analytics for all videos in the course
    const videoAnalytics = await VideoAnalytics.aggregate([
      {
        $match: { courseId: new mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: '$videoId',
          totalViews: { $sum: '$views' },
          uniqueViewers: { $addToSet: '$userId' },
          totalWatchTime: { $sum: '$watchTime' },
          completions: { $sum: { $cond: ['$completed', 1, 0] } },
          maxWatchTime: { $max: '$maxWatchTime' },
        },
      },
    ]);

    // Get video details and merge with analytics
    const analyticsMap = {};
    videoAnalytics.forEach((item) => {
      analyticsMap[item._id] = {
        totalViews: item.totalViews,
        uniqueViewers: item.uniqueViewers.length,
        totalWatchTime: item.totalWatchTime,
        averageWatchTime: item.totalViews > 0 ? item.totalWatchTime / item.totalViews : 0,
        completions: item.completions,
        completionRate: item.uniqueViewers.length > 0 
          ? (item.completions / item.uniqueViewers.length) * 100 
          : 0,
        maxWatchTime: item.maxWatchTime,
      };
    });

    // Merge with course videos
    const videosWithAnalytics = course.videos.map((video) => {
      const videoId = video._id?.toString() || video.videoId;
      const analytics = analyticsMap[videoId] || {
        totalViews: 0,
        uniqueViewers: 0,
        totalWatchTime: 0,
        averageWatchTime: 0,
        completions: 0,
        completionRate: 0,
        maxWatchTime: 0,
      };

      return {
        ...video.toObject(),
        analytics,
      };
    });

    // Calculate overall course statistics
    const overallStats = {
      totalVideos: course.videos.length,
      totalViews: Object.values(analyticsMap).reduce((sum, a) => sum + a.totalViews, 0),
      totalUniqueViewers: new Set(
        Object.values(analyticsMap).flatMap((a) => a.uniqueViewers || [])
      ).size,
      totalCompletions: Object.values(analyticsMap).reduce((sum, a) => sum + a.completions, 0),
      averageCompletionRate:
        videosWithAnalytics.length > 0
          ? videosWithAnalytics.reduce((sum, v) => sum + v.analytics.completionRate, 0) /
            videosWithAnalytics.length
          : 0,
      totalWatchTime: Object.values(analyticsMap).reduce((sum, a) => sum + a.totalWatchTime, 0),
    };

    res.json({
      videos: videosWithAnalytics,
      overallStats,
    });
  } catch (error) {
    next(error);
  }
};

// Video Comments
exports.getVideoComments = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const comments = await VideoComment.find({
      courseId: id,
      videoId,
      parentCommentId: null, // Only top-level comments
    })
      .populate('userId', 'name email avatarUrl')
      .populate({
        path: 'likes',
        select: 'name',
      })
      .sort({ isPinned: -1, createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await VideoComment.find({
          parentCommentId: comment._id,
        })
          .populate('userId', 'name email avatarUrl')
          .sort({ createdAt: 1 })
          .limit(10); // Limit replies per comment

        return {
          ...comment.toObject(),
          replies,
          replyCount: await VideoComment.countDocuments({ parentCommentId: comment._id }),
          isLiked: req.user ? comment.likes.some((id) => id.toString() === req.user._id.toString()) : false,
        };
      })
    );

    res.json({
      comments: commentsWithReplies,
      total: comments.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVideoComment = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { content, timestamp, parentCommentId } = req.body;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course to comment',
      });
    }

    const comment = new VideoComment({
      courseId: id,
      videoId,
      userId,
      content,
      timestamp: timestamp || null,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();
    await comment.populate('userId', 'name email avatarUrl');

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVideoComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await VideoComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Comment not found',
      });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You can only edit your own comments',
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('userId', 'name email avatarUrl');

    res.json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await VideoComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Comment not found',
      });
    }

    // Check if user is the owner or admin
    const isOwner = comment.userId.toString() === userId.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You can only delete your own comments',
      });
    }

    // Delete comment and all replies
    await VideoComment.deleteMany({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    });

    res.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleCommentLike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await VideoComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Comment not found',
      });
    }

    const isLiked = comment.likes.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    next(error);
  }
};

// Video Notes & Bookmarks
exports.getVideoNotes = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course',
      });
    }

    const notes = await VideoNote.find({
      userId,
      courseId: id,
      videoId: videoId || { $exists: true },
    }).sort({ timestamp: 1 });

    res.json({
      notes,
      total: notes.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVideoNote = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { content, timestamp, title, isBookmark, tags } = req.body;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course',
      });
    }

    const note = new VideoNote({
      courseId: id,
      videoId,
      userId,
      content,
      timestamp: timestamp || 0,
      title: title || null,
      isBookmark: isBookmark || false,
      tags: tags || [],
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVideoNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { content, title, tags } = req.body;
    const userId = req.user._id;

    const note = await VideoNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Note not found',
      });
    }

    if (note.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You can only edit your own notes',
      });
    }

    if (content !== undefined) note.content = content;
    if (title !== undefined) note.title = title;
    if (tags !== undefined) note.tags = tags;

    await note.save();

    res.json({
      message: 'Note updated successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await VideoNote.findById(noteId);

    if (!note) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Note not found',
      });
    }

    if (note.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You can only delete your own notes',
      });
    }

    await note.deleteOne();

    res.json({
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const bookmarks = await VideoNote.find({
      userId,
      courseId: id,
      isBookmark: true,
    })
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 });

    res.json({
      bookmarks,
      total: bookmarks.length,
    });
  } catch (error) {
    next(error);
  }
};

// Video Favorites
exports.toggleVideoFavorite = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    const existing = await VideoFavorite.findOne({
      userId,
      courseId: id,
      videoId,
    });

    if (existing) {
      await VideoFavorite.deleteOne({ _id: existing._id });
      res.json({
        message: 'Video removed from favorites',
        isFavorite: false,
      });
    } else {
      await VideoFavorite.create({
        userId,
        courseId: id,
        videoId,
      });
      res.json({
        message: 'Video added to favorites',
        isFavorite: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getVideoFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const favorites = await VideoFavorite.find({ userId })
      .populate('courseId', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    res.json({
      favorites,
      total: favorites.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkVideoFavorite = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    const favorite = await VideoFavorite.findOne({
      userId,
      courseId: id,
      videoId,
    });

    res.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    next(error);
  }
};

// Video Ratings
exports.rateVideo = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course to rate videos',
      });
    }

    const videoRating = await VideoRating.findOneAndUpdate(
      { userId, courseId: id, videoId },
      { rating, review: review || '' },
      { upsert: true, new: true }
    );

    // Calculate average rating for the video
    const ratings = await VideoRating.find({ courseId: id, videoId });
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    res.json({
      message: 'Rating saved successfully',
      rating: videoRating,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVideoRatings = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const ratings = await VideoRating.find({ courseId: id, videoId })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    const userRating = req.user
      ? await VideoRating.findOne({ userId: req.user._id, courseId: id, videoId })
      : null;

    res.json({
      ratings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      userRating,
    });
  } catch (error) {
    next(error);
  }
};

// Video History
exports.getVideoHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get video history from VideoAnalytics
    const history = await VideoAnalytics.find({ userId })
      .populate('courseId', 'title slug thumbnail')
      .sort({ lastWatched: -1 })
      .limit(50);

    const historyWithDetails = await Promise.all(
      history.map(async (item) => {
        const course = await Course.findById(item.courseId).select('videos');
        const video = course?.videos.find((v) => v._id?.toString() === item.videoId);

        return {
          _id: item._id,
          courseId: item.courseId,
          videoId: item.videoId,
          videoTitle: video?.title || 'Unknown Video',
          courseTitle: item.courseId.title || 'Unknown Course',
          courseSlug: item.courseId.slug,
          lastWatched: item.lastWatched,
          maxWatchTime: item.maxWatchTime,
          duration: video?.duration || 0,
          completed: item.completed,
          views: item.views,
        };
      })
    );

    res.json({
      history: historyWithDetails,
      total: historyWithDetails.length,
    });
  } catch (error) {
    next(error);
  }
};

// Video Subtitles
exports.getVideoSubtitles = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const subtitles = await VideoSubtitle.find({
      courseId: id,
      videoId,
    }).sort({ isDefault: -1, language: 1 });

    res.json({
      subtitles,
      total: subtitles.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVideoSubtitle = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { language, subtitleUrl, format, isDefault } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await VideoSubtitle.updateMany(
        { courseId: id, videoId },
        { isDefault: false }
      );
    }

    const subtitle = new VideoSubtitle({
      courseId: id,
      videoId,
      language,
      subtitleUrl,
      format: format || 'vtt',
      isDefault: isDefault || false,
    });

    await subtitle.save();

    res.status(201).json({
      message: 'Subtitle created successfully',
      subtitle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        code: 'DUPLICATE_ERROR',
        message: 'Subtitle for this language already exists',
      });
    }
    next(error);
  }
};

exports.updateVideoSubtitle = async (req, res, next) => {
  try {
    const { subtitleId } = req.params;
    const { language, subtitleUrl, format, isDefault } = req.body;

    const subtitle = await VideoSubtitle.findById(subtitleId);

    if (!subtitle) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Subtitle not found',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await VideoSubtitle.updateMany(
        { courseId: subtitle.courseId, videoId: subtitle.videoId, _id: { $ne: subtitleId } },
        { isDefault: false }
      );
    }

    if (language !== undefined) subtitle.language = language;
    if (subtitleUrl !== undefined) subtitle.subtitleUrl = subtitleUrl;
    if (format !== undefined) subtitle.format = format;
    if (isDefault !== undefined) subtitle.isDefault = isDefault;

    await subtitle.save();

    res.json({
      message: 'Subtitle updated successfully',
      subtitle,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoSubtitle = async (req, res, next) => {
  try {
    const { subtitleId } = req.params;

    const subtitle = await VideoSubtitle.findById(subtitleId);

    if (!subtitle) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Subtitle not found',
      });
    }

    await subtitle.deleteOne();

    res.json({
      message: 'Subtitle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Video Playlists
exports.createPlaylist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, isPublic } = req.body;

    const playlist = new VideoPlaylist({
      userId,
      title,
      description,
      isPublic: isPublic || false,
      videos: [],
    });

    await playlist.save();

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlaylists = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { includePublic } = req.query;

    const query = includePublic === 'true' 
      ? { $or: [{ userId }, { isPublic: true }] }
      : { userId };

    const playlists = await VideoPlaylist.find(query)
      .populate('videos.courseId', 'title slug thumbnail')
      .sort({ createdAt: -1 });

    res.json({
      playlists,
      total: playlists.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      $or: [{ userId }, { isPublic: true }],
    })
      .populate('videos.courseId', 'title slug thumbnail')
      .populate('userId', 'name email');

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    res.json({
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;
    const { title, description, isPublic } = req.body;

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      userId,
    });

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({
      message: 'Playlist updated successfully',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      userId,
    });

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    await playlist.deleteOne();

    res.json({
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.addVideoToPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;
    const { courseId, videoId } = req.body;

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      userId,
    });

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    // Check if video already exists
    const existingVideo = playlist.videos.find(
      (v) => v.courseId.toString() === courseId && v.videoId === videoId
    );

    if (existingVideo) {
      return res.status(400).json({
        code: 'DUPLICATE_ERROR',
        message: 'Video already in playlist',
      });
    }

    playlist.videos.push({
      courseId,
      videoId,
      order: playlist.videos.length,
    });

    await playlist.save();

    res.json({
      message: 'Video added to playlist successfully',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeVideoFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId, videoIndex } = req.params;
    const userId = req.user._id;

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      userId,
    });

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    playlist.videos.splice(parseInt(videoIndex), 1);
    await playlist.save();

    res.json({
      message: 'Video removed from playlist successfully',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderPlaylistVideos = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;
    const { videoOrders } = req.body; // Array of { videoIndex, newOrder }

    const playlist = await VideoPlaylist.findOne({
      _id: playlistId,
      userId,
    });

    if (!playlist) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Playlist not found',
      });
    }

    videoOrders.forEach(({ videoIndex, newOrder }) => {
      if (playlist.videos[videoIndex]) {
        playlist.videos[videoIndex].order = newOrder;
      }
    });

    playlist.videos.sort((a, b) => a.order - b.order);
    await playlist.save();

    res.json({
      message: 'Playlist reordered successfully',
      playlist,
    });
  } catch (error) {
    next(error);
  }
};

// Video Quizzes
exports.getVideoQuiz = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user?._id;

    const quiz = await VideoQuiz.findOne({
      courseId: id,
      videoId,
    });

    if (!quiz) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Quiz not found for this video',
      });
    }

    // Get user's previous attempts if authenticated
    let previousAttempts = [];
    let bestScore = 0;
    if (userId) {
      previousAttempts = await QuizAttempt.find({
        userId,
        quizId: quiz._id,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('score percentage passed completedAt');

      if (previousAttempts.length > 0) {
        bestScore = Math.max(...previousAttempts.map((a) => a.percentage));
      }
    }

    // Don't send correct answers if user hasn't passed yet
    const quizData = quiz.toObject();
    if (userId && bestScore < quiz.passingScore) {
      quizData.questions = quizData.questions.map((q) => {
        const question = { ...q };
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          question.options = q.options.map((opt) => ({
            text: opt.text,
            isCorrect: false, // Hide correct answer
          }));
        }
        if (q.type === 'short-answer') {
          delete question.correctAnswer;
        }
        return question;
      });
    }

    res.json({
      quiz: quizData,
      previousAttempts,
      bestScore,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitQuizAttempt = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;
    const { answers, timeSpent } = req.body;

    const quiz = await VideoQuiz.findOne({
      courseId: id,
      videoId,
    });

    if (!quiz) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Quiz not found',
      });
    }

    // Check if retake is allowed
    if (!quiz.allowRetake) {
      const existingAttempt = await QuizAttempt.findOne({
        userId,
        quizId: quiz._id,
        passed: true,
      });

      if (existingAttempt) {
        return res.status(400).json({
          code: 'RETAKE_NOT_ALLOWED',
          message: 'You have already passed this quiz. Retakes are not allowed.',
        });
      }
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const processedAnswers = quiz.questions.map((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];
      let isCorrect = false;
      let points = 0;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const selectedOption = question.options[userAnswer];
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true;
          points = question.points;
          earnedPoints += points;
        }
      } else if (question.type === 'short-answer') {
        const userAnswerText = (userAnswer || '').toLowerCase().trim();
        const correctAnswer = (question.correctAnswer || '').toLowerCase().trim();
        if (userAnswerText === correctAnswer) {
          isCorrect = true;
          points = question.points;
          earnedPoints += points;
        }
      }

      return {
        questionId: question._id,
        answer: userAnswer,
        isCorrect,
        points,
      };
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Save attempt
    const attempt = new QuizAttempt({
      userId,
      quizId: quiz._id,
      courseId: id,
      videoId,
      answers: processedAnswers,
      score: earnedPoints,
      percentage: Math.round(percentage * 10) / 10,
      passed,
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
    });

    await attempt.save();

    // Return results with correct answers
    const results = {
      attempt: attempt.toObject(),
      questions: quiz.questions.map((q, index) => ({
        question: q.question,
        type: q.type,
        correctAnswer: q.type === 'multiple-choice' || q.type === 'true-false'
          ? q.options.findIndex((opt) => opt.isCorrect)
          : q.correctAnswer,
        explanation: q.explanation,
        userAnswer: answers[index],
        isCorrect: processedAnswers[index].isCorrect,
      })),
    };

    res.json({
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz submitted. Review your answers.',
      ...results,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVideoQuiz = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const quizData = req.body;

    // Verify user is admin/instructor
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    const quiz = new VideoQuiz({
      courseId: id,
      videoId,
      ...quizData,
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVideoQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;

    const quiz = await VideoQuiz.findByIdAndUpdate(quizId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Quiz not found',
      });
    }

    res.json({
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await VideoQuiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Quiz not found',
      });
    }

    // Delete all attempts
    await QuizAttempt.deleteMany({ quizId: quiz._id });

    // Delete quiz
    await quiz.deleteOne();

    res.json({
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Certificates
exports.generateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      userId,
      courseId: id,
    });

    if (existingCertificate) {
      return res.json({
        message: 'Certificate already exists',
        certificate: existingCertificate,
      });
    }

    // Verify enrollment and completion
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course',
      });
    }

    // Get course progress
    const progress = await this.getCourseProgress(req, res, () => {});
    if (!progress || progress.courseProgress < 100) {
      return res.status(400).json({
        code: 'INCOMPLETE',
        message: 'Course must be 100% complete to generate certificate',
      });
    }

    // Generate certificate number and verification code
    const certificateNumber = `CERT-${Date.now()}-${userId.toString().slice(-6)}`;
    const verificationCode = require('crypto').randomBytes(16).toString('hex');

    const certificate = new Certificate({
      userId,
      courseId: id,
      certificateNumber,
      completionDate: new Date(),
      score: progress.courseProgress,
      verificationCode,
    });

    await certificate.save();

    // Populate course details
    await certificate.populate('courseId', 'title instructor');
    await certificate.populate('userId', 'name email');

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserCertificates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title slug thumbnail instructor')
      .sort({ issuedAt: -1 });

    res.json({
      certificates,
      total: certificates.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId)
      .populate('courseId', 'title description instructor')
      .populate('userId', 'name email');

    if (!certificate) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Certificate not found',
      });
    }

    res.json({
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyCertificate = async (req, res, next) => {
  try {
    const { verificationCode } = req.query;

    if (!verificationCode) {
      return res.status(400).json({
        code: 'MISSING_CODE',
        message: 'Verification code is required',
      });
    }

    const certificate = await Certificate.findOne({ verificationCode })
      .populate('courseId', 'title')
      .populate('userId', 'name email');

    if (!certificate) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Certificate not found or invalid verification code',
      });
    }

    res.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        courseTitle: certificate.courseId.title,
        studentName: certificate.userId.name,
        issuedAt: certificate.issuedAt,
        completionDate: certificate.completionDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Video Recommendations
exports.getRecommendedVideos = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { limit = 10 } = req.query;

    if (!userId) {
      // For non-authenticated users, return popular courses
      const popularCourses = await Course.find({ publishStatus: 'published' })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('title slug thumbnail price instructorId category level')
        .populate('instructorId', 'name');

      return res.json({
        recommendations: popularCourses,
        type: 'popular',
      });
    }

    // Get user's watch history
    const watchHistory = await VideoAnalytics.find({ userId })
      .populate('courseId', 'category tags level')
      .sort({ lastWatched: -1 })
      .limit(20);

    if (watchHistory.length === 0) {
      // No history, return popular courses
      const popularCourses = await Course.find({ publishStatus: 'published' })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('title slug thumbnail price instructorId category level')
        .populate('instructorId', 'name');

      return res.json({
        recommendations: popularCourses,
        type: 'popular',
      });
    }

    // Extract user preferences
    const categories = {};
    const tags = {};
    const levels = {};

    watchHistory.forEach((item) => {
      if (item.courseId?.category) {
        categories[item.courseId.category] = (categories[item.courseId.category] || 0) + 1;
      }
      if (item.courseId?.tags && Array.isArray(item.courseId.tags)) {
        item.courseId.tags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
      if (item.courseId?.level) {
        levels[item.courseId.level] = (levels[item.courseId.level] || 0) + 1;
      }
    });

    // Get top preferences
    const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
    const topTags = Object.keys(tags)
      .sort((a, b) => tags[b] - tags[a])
      .slice(0, 3);
    const topLevel = Object.keys(levels).sort((a, b) => levels[b] - levels[a])[0];

    // Get enrolled course IDs to exclude
    const enrollments = await Enrollment.find({ userId, status: 'active' }).select('courseId');
    const enrolledCourseIds = enrollments.map((e) => e.courseId.toString());

    // Build recommendation query
    const recommendationQuery = {
      publishStatus: 'published',
      _id: { $nin: enrolledCourseIds },
    };

    // Add filters based on preferences
    if (topCategory) {
      recommendationQuery.category = topCategory;
    }
    if (topLevel) {
      recommendationQuery.level = topLevel;
    }
    if (topTags.length > 0) {
      recommendationQuery.tags = { $in: topTags };
    }

    // Get recommended courses
    let recommendedCourses = await Course.find(recommendationQuery)
      .select('title slug thumbnail price instructorId category level tags totalDuration')
      .populate('instructorId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * 2); // Get more to filter

    // If not enough recommendations, add popular courses
    if (recommendedCourses.length < parseInt(limit)) {
      const popularCourses = await Course.find({
        publishStatus: 'published',
        _id: { $nin: [...enrolledCourseIds, ...recommendedCourses.map((c) => c._id.toString())] },
      })
        .select('title slug thumbnail price instructorId category level tags totalDuration')
        .populate('instructorId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) - recommendedCourses.length);

      recommendedCourses = [...recommendedCourses, ...popularCourses];
    }

    // Limit and return
    recommendedCourses = recommendedCourses.slice(0, parseInt(limit));

    res.json({
      recommendations: recommendedCourses,
      type: 'personalized',
      preferences: {
        category: topCategory,
        tags: topTags,
        level: topLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedVideos = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { limit = 5 } = req.query;

    // Get current course
    const course = await Course.findById(id).select('category tags level videos');
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Get current video
    const currentVideo = course.videos.find((v) => v._id?.toString() === videoId);
    if (!currentVideo) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Video not found',
      });
    }

    // Find related courses based on category, tags, level
    const relatedCourses = await Course.find({
      _id: { $ne: id },
      publishStatus: 'published',
      $or: [
        { category: course.category },
        { tags: { $in: course.tags || [] } },
        { level: course.level },
      ],
    })
      .select('title slug thumbnail price instructorId category level')
      .populate('instructorId', 'name')
      .limit(parseInt(limit));

    // Get videos from related courses
    const relatedVideos = [];
    for (const relatedCourse of relatedCourses) {
      const fullCourse = await Course.findById(relatedCourse._id).select('videos');
      if (fullCourse && fullCourse.videos.length > 0) {
        const video = fullCourse.videos[0]; // Get first video
        relatedVideos.push({
          course: relatedCourse,
          video: {
            _id: video._id,
            title: video.title,
            duration: video.duration,
            thumbnail: video.thumbnail,
            isFree: video.isFree,
          },
        });
      }
    }

    res.json({
      relatedVideos: relatedVideos.slice(0, parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Video Download Support
exports.getVideoDownloadUrl = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course to download videos',
      });
    }

    // Get course and video
    const course = await Course.findById(id).select('videos');
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    const video = course.videos.find((v) => v._id?.toString() === videoId);
    if (!video) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Video not found',
      });
    }

    // Check if video is accessible
    if (!video.isFree && !enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have access to download this video',
      });
    }

    // Generate signed URL for download (valid for 1 hour)
    const downloadUrl = getSignedVideoUrl(video.videoUrl, 3600);

    if (!downloadUrl) {
      return res.status(500).json({
        code: 'ERROR',
        message: 'Failed to generate download URL',
      });
    }

    res.json({
      downloadUrl,
      expiresIn: 3600, // seconds
      fileName: `${video.title.replace(/[^a-z0-9]/gi, '_')}.mp4`,
    });
  } catch (error) {
    next(error);
  }
};

// Video Transcription
exports.getVideoTranscription = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { language = 'en' } = req.query;

    const transcription = await VideoTranscription.findOne({
      courseId: id,
      videoId,
      language,
      status: 'completed',
    });

    if (!transcription) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Transcription not found for this video',
      });
    }

    res.json({
      transcription,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVideoTranscription = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { language, segments, fullText, provider } = req.body;

    // Check if transcription already exists
    const existing = await VideoTranscription.findOne({
      courseId: id,
      videoId,
      language,
    });

    if (existing) {
      // Update existing
      if (segments) existing.segments = segments;
      if (fullText !== undefined) existing.fullText = fullText;
      if (provider) existing.provider = provider;
      existing.status = 'completed';
      await existing.save();

      return res.json({
        message: 'Transcription updated successfully',
        transcription: existing,
      });
    }

    // Create new
    const transcription = new VideoTranscription({
      courseId: id,
      videoId,
      language: language || 'en',
      segments: segments || [],
      fullText: fullText || '',
      provider: provider || 'manual',
      status: 'completed',
    });

    await transcription.save();

    res.status(201).json({
      message: 'Transcription created successfully',
      transcription,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        code: 'DUPLICATE_ERROR',
        message: 'Transcription for this language already exists',
      });
    }
    next(error);
  }
};

exports.updateVideoTranscription = async (req, res, next) => {
  try {
    const { transcriptionId } = req.params;
    const { segments, fullText, status } = req.body;

    const transcription = await VideoTranscription.findById(transcriptionId);

    if (!transcription) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Transcription not found',
      });
    }

    if (segments) transcription.segments = segments;
    if (fullText !== undefined) transcription.fullText = fullText;
    if (status) transcription.status = status;

    await transcription.save();

    res.json({
      message: 'Transcription updated successfully',
      transcription,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoTranscription = async (req, res, next) => {
  try {
    const { transcriptionId } = req.params;

    const transcription = await VideoTranscription.findById(transcriptionId);

    if (!transcription) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Transcription not found',
      });
    }

    await transcription.deleteOne();

    res.json({
      message: 'Transcription deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Live Streaming
exports.createLiveStream = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, duration, streamUrl, streamKey, thumbnail, chatEnabled, qaEnabled, maxViewers } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    if (course.instructorId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Only course instructor or admin can create live streams',
      });
    }

    const liveStream = new LiveStream({
      courseId: id,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      streamUrl,
      streamKey,
      thumbnail,
      chatEnabled: chatEnabled !== false,
      qaEnabled: qaEnabled !== false,
      maxViewers,
      createdBy: userId,
      status: 'scheduled',
    });

    await liveStream.save();
    await liveStream.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Live stream created successfully',
      liveStream,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLiveStreams = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, upcoming } = req.query;

    const query = { courseId: id };
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    const liveStreams = await LiveStream.find(query)
      .populate('createdBy', 'name email')
      .sort({ scheduledAt: -1 });

    res.json({
      liveStreams,
      total: liveStreams.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLiveStream = async (req, res, next) => {
  try {
    const { streamId } = req.params;

    const liveStream = await LiveStream.findById(streamId)
      .populate('courseId', 'title slug')
      .populate('createdBy', 'name email avatarUrl');

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    res.json({
      liveStream,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLiveStream = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    if (liveStream.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this stream',
      });
    }

    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        liveStream[key] = updateData[key];
      }
    });

    if (updateData.scheduledAt) {
      liveStream.scheduledAt = new Date(updateData.scheduledAt);
    }

    await liveStream.save();

    res.json({
      message: 'Live stream updated successfully',
      liveStream,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLiveStream = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    if (liveStream.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this stream',
      });
    }

    await liveStream.deleteOne();

    res.json({
      message: 'Live stream deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.startLiveStream = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    if (liveStream.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to start this stream',
      });
    }

    liveStream.status = 'live';
    liveStream.viewers = 0;
    await liveStream.save();

    res.json({
      message: 'Live stream started',
      liveStream,
    });
  } catch (error) {
    next(error);
  }
};

exports.endLiveStream = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { recordedVideoUrl } = req.body;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    if (liveStream.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to end this stream',
      });
    }

    liveStream.status = 'ended';
    if (recordedVideoUrl) {
      liveStream.recordedVideoUrl = recordedVideoUrl;
    }
    await liveStream.save();

    res.json({
      message: 'Live stream ended',
      liveStream,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateViewerCount = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { viewers } = req.body;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    liveStream.viewers = viewers || 0;
    await liveStream.save();

    res.json({
      message: 'Viewer count updated',
      viewers: liveStream.viewers,
    });
  } catch (error) {
    next(error);
  }
};

// Live Stream Chat
exports.getLiveStreamChat = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await LiveStreamChat.find({ streamId })
      .populate('userId', 'name email avatarUrl')
      .populate('parentMessageId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      messages: messages.reverse(),
      total: messages.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendLiveStreamMessage = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { message, type, parentMessageId } = req.body;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);
    if (!liveStream) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Live stream not found',
      });
    }

    if (liveStream.status !== 'live' && liveStream.status !== 'scheduled') {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'Stream is not active',
      });
    }

    if (!liveStream.chatEnabled && type === 'message') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Chat is disabled for this stream',
      });
    }

    const chatMessage = new LiveStreamChat({
      streamId,
      userId,
      message,
      type: type || 'message',
      parentMessageId: parentMessageId || null,
    });

    await chatMessage.save();
    await chatMessage.populate('userId', 'name email avatarUrl');

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage,
    });
  } catch (error) {
    next(error);
  }
};

exports.likeLiveStreamMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const chatMessage = await LiveStreamChat.findById(messageId);

    if (!chatMessage) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Message not found',
      });
    }

    chatMessage.likes = (chatMessage.likes || 0) + 1;
    await chatMessage.save();

    res.json({
      message: 'Message liked',
      likes: chatMessage.likes,
    });
  } catch (error) {
    next(error);
  }
};

// Video Annotations
exports.createVideoAnnotation = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const {
      type,
      timestamp,
      title,
      content,
      color,
      position,
      isVisible,
      isPublic,
      attachments,
    } = req.body;

    const annotation = await VideoAnnotation.create({
      courseId: id,
      videoId,
      createdBy: req.user._id,
      type,
      timestamp,
      title,
      content,
      color,
      position,
      isVisible,
      isPublic,
      attachments,
    });

    res.status(201).json({
      message: 'Annotation created successfully',
      annotation,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVideoAnnotations = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;

    const isAdmin = (req.user?.roles || []).includes('admin') || req.user?.role === 'admin';
    const isInstructor = (req.user?.roles || []).includes('instructor') || req.user?.role === 'instructor';

    const query = { courseId: id, videoId };

    if (!isAdmin && !isInstructor) {
      query.isVisible = true;
      query.$or = [
        { isPublic: true },
        ...(req.user ? [{ createdBy: req.user._id }] : []),
      ];
    }

    const annotations = await VideoAnnotation.find(query)
      .populate('createdBy', 'name email avatarUrl')
      .sort({ timestamp: 1, createdAt: 1 });

    res.json({
      annotations,
      total: annotations.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVideoAnnotation = async (req, res, next) => {
  try {
    const { annotationId } = req.params;
    const updateData = req.body;

    const annotation = await VideoAnnotation.findById(annotationId);
    if (!annotation) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Annotation not found' });
    }

    const isOwner = annotation.createdBy.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';
    const isInstructor = (req.user.roles || []).includes('instructor') || req.user.role === 'instructor';

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to update this annotation' });
    }

    Object.assign(annotation, updateData);
    await annotation.save();

    res.json({
      message: 'Annotation updated successfully',
      annotation,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideoAnnotation = async (req, res, next) => {
  try {
    const { annotationId } = req.params;

    const annotation = await VideoAnnotation.findById(annotationId);
    if (!annotation) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Annotation not found' });
    }

    const isOwner = annotation.createdBy.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';
    const isInstructor = (req.user.roles || []).includes('instructor') || req.user.role === 'instructor';

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to delete this annotation' });
    }

    await annotation.deleteOne();

    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Course Discussions/Forums
exports.createCourseDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You must be enrolled in this course to post a discussion',
      });
    }

    const discussion = await CourseDiscussion.create({
      courseId: id,
      userId,
      title,
      content,
      category,
      tags,
    });

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCourseDiscussions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, page = 1, limit = 20, sort = '-isPinned -lastActivity' } = req.query;

    const query = { courseId: id };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const discussions = await CourseDiscussion.find(query)
      .populate('userId', 'name email avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await CourseDiscussion.countDocuments(query);

    res.json({
      discussions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCourseDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId)
      .populate('userId', 'name email avatarUrl')
      .populate('replies.userId', 'name email avatarUrl');

    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    discussion.views += 1;
    await discussion.save();

    res.json({ discussion });
  } catch (error) {
    next(error);
  }
};

exports.updateCourseDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.params;
    const updateData = req.body;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const isOwner = discussion.userId.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to update this discussion' });
    }

    Object.assign(discussion, updateData);
    await discussion.save();

    res.json({ message: 'Discussion updated successfully', discussion });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourseDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const isOwner = discussion.userId.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to delete this discussion' });
    }

    await discussion.deleteOne();

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.addDiscussionReply = async (req, res, next) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    if (discussion.isLocked) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Discussion is locked' });
    }

    discussion.replies.push({ userId, content });
    await discussion.save();

    res.status(201).json({
      message: 'Reply added successfully',
      discussion,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDiscussionReply = async (req, res, next) => {
  try {
    const { discussionId, replyIndex } = req.params;
    const { content } = req.body;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const reply = discussion.replies[Number(replyIndex)];
    if (!reply) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reply not found' });
    }

    const isOwner = reply.userId.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to update this reply' });
    }

    reply.content = content;
    await discussion.save();

    res.json({ message: 'Reply updated successfully', discussion });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiscussionReply = async (req, res, next) => {
  try {
    const { discussionId, replyIndex } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const reply = discussion.replies[Number(replyIndex)];
    if (!reply) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reply not found' });
    }

    const isOwner = reply.userId.toString() === req.user._id.toString();
    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to delete this reply' });
    }

    discussion.replies.splice(Number(replyIndex), 1);
    await discussion.save();

    res.json({ message: 'Reply deleted successfully', discussion });
  } catch (error) {
    next(error);
  }
};

exports.likeDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    discussion.likes += 1;
    await discussion.save();

    res.json({ message: 'Discussion liked', likes: discussion.likes });
  } catch (error) {
    next(error);
  }
};

exports.likeDiscussionReply = async (req, res, next) => {
  try {
    const { discussionId, replyIndex } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const reply = discussion.replies[Number(replyIndex)];
    if (!reply) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reply not found' });
    }

    reply.likes += 1;
    await discussion.save();

    res.json({ message: 'Reply liked', likes: reply.likes });
  } catch (error) {
    next(error);
  }
};

exports.markReplyAsSolution = async (req, res, next) => {
  try {
    const { discussionId, replyIndex } = req.params;

    const discussion = await CourseDiscussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Discussion not found' });
    }

    const reply = discussion.replies[Number(replyIndex)];
    if (!reply) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reply not found' });
    }

    const isAdmin = (req.user.roles || []).includes('admin') || req.user.role === 'admin';
    const isInstructor = (req.user.roles || []).includes('instructor') || req.user.role === 'instructor';

    if (!isAdmin && !isInstructor) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized to mark solution' });
    }

    discussion.replies.forEach((item) => {
      item.isSolution = false;
    });
    reply.isSolution = true;
    discussion.isResolved = true;

    await discussion.save();

    res.json({ message: 'Reply marked as solution', discussion });
  } catch (error) {
    next(error);
  }
};

// Notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { read, limit = 50 } = req.query;

    const query = { userId };
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('courseId', 'title slug thumbnail')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this notification',
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this notification',
      });
    }

    await notification.deleteOne();

    res.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create notification
const createNotification = async (userId, type, title, message, link, courseId, videoId, metadata) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link,
      courseId,
      videoId,
      metadata,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Auto-create notifications on certain events
// This can be called from other controllers
exports.createNotification = createNotification;

// Student Video Analytics Dashboard
exports.getStudentVideoAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, timeRange = '30' } = req.query;

    // Build date filter
    let dateFilter = {};
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { lastWatched: { $gte: startDate } };
    }

    // Build query
    const query = { userId, ...dateFilter };
    if (courseId) query.courseId = courseId;

    // Get analytics
    const analytics = await VideoAnalytics.find(query)
      .populate('courseId', 'title slug thumbnail')
      .populate('videoId')
      .sort({ lastWatched: -1 });

    // Get enrollment data for course progress
    const enrollments = await Enrollment.find({ userId, status: 'active' })
      .populate('courseId', 'title slug thumbnail')
      .select('courseId progress videoProgress');

    // Calculate statistics
    const stats = {
      totalVideosWatched: analytics.length,
      totalWatchTime: analytics.reduce((sum, a) => sum + (a.watchTime || 0), 0),
      totalCompletions: analytics.filter((a) => a.completed).length,
      averageWatchTime: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.watchTime || 0), 0) / analytics.length
        : 0,
      coursesInProgress: enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
      coursesCompleted: enrollments.filter((e) => e.progress === 100).length,
      totalCourses: enrollments.length,
    };

    // Get watch time by day
    const watchTimeByDay = await VideoAnalytics.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastWatched' },
          },
          watchTime: { $sum: '$watchTime' },
          videos: { $addToSet: '$videoId' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get top watched courses
    const topCourses = await VideoAnalytics.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$courseId',
          watchTime: { $sum: '$watchTime' },
          videos: { $addToSet: '$videoId' },
          completions: { $sum: { $cond: ['$completed', 1, 0] } },
        },
      },
      {
        $sort: { watchTime: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Populate course details
    const topCoursesWithDetails = await Promise.all(
      topCourses.map(async (item) => {
        const course = await Course.findById(item._id).select('title slug thumbnail');
        return {
          course,
          watchTime: item.watchTime,
          videosWatched: item.videos.length,
          completions: item.completions,
        };
      })
    );

    res.json({
      stats,
      watchTimeByDay,
      topCourses: topCoursesWithDetails,
      recentActivity: analytics.slice(0, 10),
      enrollments: enrollments.map((e) => ({
        course: e.courseId,
        progress: e.progress,
        videoProgress: e.videoProgress,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Update video progress
exports.updateVideoProgress = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { currentTime, duration, completed } = req.body;
    const userId = req.user._id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(404).json({
        code: 'NOT_ENROLLED',
        message: 'You are not enrolled in this course',
      });
    }

    // Find or create video progress entry
    const progressIndex = enrollment.videoProgress.findIndex(
      (p) => p.videoId === videoId
    );

    const progressData = {
      videoId,
      currentTime: currentTime || 0,
      duration: duration || 0,
      completed: completed || false,
      lastUpdated: new Date(),
    };

    if (progressIndex >= 0) {
      // Update existing progress
      enrollment.videoProgress[progressIndex] = progressData;
    } else {
      // Add new progress
      enrollment.videoProgress.push(progressData);
    }

    // Update overall course progress
    const course = await Course.findById(id);
    if (course && course.videos) {
      const totalVideos = course.videos.length;
      const completedVideos = enrollment.videoProgress.filter((p) => p.completed).length;
      enrollment.progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    }

    await enrollment.save();

    res.json({
      message: 'Progress updated successfully',
      progress: progressData,
      courseProgress: enrollment.progress,
    });
  } catch (error) {
    next(error);
  }
};

// Get course progress for enrolled student
exports.getCourseProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: id,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(404).json({
        code: 'NOT_ENROLLED',
        message: 'You are not enrolled in this course',
      });
    }

    // Get course to get video list
    const course = await Course.findById(id).select('videos');
    
    // Build progress map
    const progressMap = {};
    enrollment.videoProgress.forEach((progress) => {
      progressMap[progress.videoId] = {
        currentTime: progress.currentTime,
        duration: progress.duration,
        completed: progress.completed,
        watchedAt: progress.watchedAt,
        lastUpdated: progress.lastUpdated,
      };
    });

    // Find last watched video
    let lastWatchedVideo = null;
    if (enrollment.videoProgress.length > 0) {
      const sortedProgress = [...enrollment.videoProgress].sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
      lastWatchedVideo = sortedProgress[0].videoId;
    }

    res.json({
      courseProgress: enrollment.progress,
      videoProgress: progressMap,
      completedVideos: enrollment.videoProgress
        .filter((p) => p.completed)
        .map((p) => p.videoId),
      lastWatchedVideo,
      totalVideos: course?.videos?.length || 0,
      completedCount: enrollment.videoProgress.filter((p) => p.completed).length,
    });
  } catch (error) {
    next(error);
  }
};

// Get course videos
exports.getCourseVideos = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).select('videos publishStatus');

    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    // Check if course is published
    if (course.publishStatus !== 'published') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Course is not published' });
    }

    // Check if user is enrolled (if authenticated)
    let hasAccess = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: id,
        status: 'active',
      });
      hasAccess = !!enrollment;
    }

    // Filter videos based on access
    const videos = course.videos.map((video) => {
      // If user has access or video is free, show full details
      if (hasAccess || video.isFree) {
        return video;
      }
      // Otherwise, show limited info (title only for preview)
      return {
        _id: video._id,
        title: video.title,
        isFree: video.isFree,
        order: video.order,
        locked: true,
      };
    });

    // Sort videos by order
    videos.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Optionally generate signed URLs for S3 videos (if enabled)
    // This adds security by making URLs time-limited
    const useSignedUrls = req.query.signed === 'true' || config.aws.useSignedUrls === true;
    if (useSignedUrls) {
      videos = videos.map((video) => {
        if (video.videoUrl && !video.locked) {
          // Only sign URLs for videos user has access to
          return {
            ...video,
            videoUrl: getSignedVideoUrl(video.videoUrl, 3600), // 1 hour expiry
          };
        }
        return video;
      });
    }

    res.json({
      videos,
      hasAccess,
      totalVideos: course.videos.length,
    });
  } catch (error) {
    next(error);
  }
};
