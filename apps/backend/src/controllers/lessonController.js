const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({ courseId }).sort('order');

    res.json({ lessons });
  } catch (error) {
    next(error);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' });
    }

    // Check if user has access
    if (!lesson.isFree && req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: lesson.courseId,
        status: 'active',
      });

      if (!enrollment) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Not enrolled in this course' });
      }
    }

    res.json({ lesson });
  } catch (error) {
    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const lessonData = req.body;

    const lesson = await Lesson.create(lessonData);

    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lesson = await Lesson.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!lesson) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.markLessonComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Lesson not found' });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId: lesson.courseId,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not enrolled in this course' });
    }

    if (!enrollment.completedLessons.includes(id)) {
      enrollment.completedLessons.push(id);
      await enrollment.save();
    }

    res.json({ message: 'Lesson marked as complete' });
  } catch (error) {
    next(error);
  }
};

