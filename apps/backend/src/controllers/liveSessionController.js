const LiveSession = require('../models/LiveSession');
const Enrollment = require('../models/Enrollment');

exports.getAllLiveSessions = async (req, res, next) => {
  try {
    const { courseId, status, startDate, endDate } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startAt = {};
      if (startDate) query.startAt.$gte = new Date(startDate);
      if (endDate) query.startAt.$lte = new Date(endDate);
    }

    const sessions = await LiveSession.find(query)
      .populate('courseId', 'title thumbnail')
      .populate('batchId', 'name')
      .sort('startAt');

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await LiveSession.findById(id)
      .populate('courseId', 'title thumbnail')
      .populate('batchId', 'name');

    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Live session not found' });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

exports.joinSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await LiveSession.findById(id);

    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Live session not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: session.courseId,
      status: 'active',
    });

    if (!enrollment) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Not enrolled in this course' });
    }

    // Return join link
    res.json({
      joinLink: session.attendeeLink || `https://meet.example.com/session-${session._id}`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const sessionData = req.body;

    const session = await LiveSession.create(sessionData);

    res.status(201).json({ message: 'Live session created successfully', session });
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await LiveSession.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Live session not found' });
    }

    res.json({ message: 'Live session updated successfully', session });
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await LiveSession.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Live session not found' });
    }

    res.json({ message: 'Live session deleted successfully' });
  } catch (error) {
    next(error);
  }
};

