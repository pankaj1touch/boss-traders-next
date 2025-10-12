const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.createFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Must be enrolled to leave feedback' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ userId, courseId });
    if (existingFeedback) {
      return res.status(400).json({ code: 'DUPLICATE', message: 'Feedback already submitted' });
    }

    const feedback = await Feedback.create({
      userId,
      courseId,
      rating,
      comment,
      status: 'pending',
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    next(error);
  }
};

exports.getCourseFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status = 'approved' } = req.query;

    const feedback = await Feedback.find({ courseId, status })
      .populate('userId', 'name avatarUrl')
      .sort('-createdAt');

    res.json({ feedback });
  } catch (error) {
    next(error);
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderatorNote } = req.body;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Feedback not found' });
    }

    feedback.status = status;
    if (moderatorNote) feedback.moderatorNote = moderatorNote;
    await feedback.save();

    // Update course rating if approved
    if (status === 'approved') {
      const approvedFeedback = await Feedback.find({
        courseId: feedback.courseId,
        status: 'approved',
      });

      const avgRating = approvedFeedback.reduce((sum, fb) => sum + fb.rating, 0) / approvedFeedback.length;

      await Course.findByIdAndUpdate(feedback.courseId, {
        rating: avgRating,
        ratingCount: approvedFeedback.length,
      });
    }

    res.json({ message: 'Feedback status updated', feedback });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Feedback not found' });
    }

    // Only allow user or admin to delete
    if (feedback.userId.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not authorized' });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    next(error);
  }
};

