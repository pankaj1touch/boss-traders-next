const Batch = require('../models/Batch');
const { validateRRule, hasScheduleConflict } = require('../utils/rruleHelper');

exports.getAllBatches = async (req, res, next) => {
  try {
    const { courseId, locationId, status } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (locationId) query.locationId = locationId;
    if (status) query.status = status;

    const batches = await Batch.find(query)
      .populate('courseId', 'title')
      .populate('locationId', 'name address')
      .populate('instructorId', 'name')
      .sort('startDate');

    res.json({ batches });
  } catch (error) {
    next(error);
  }
};

exports.getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id)
      .populate('courseId', 'title')
      .populate('locationId', 'name address timezone')
      .populate('instructorId', 'name avatarUrl');

    if (!batch) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    next(error);
  }
};

exports.createBatch = async (req, res, next) => {
  try {
    const batchData = req.body;

    // Validate RRULE if provided
    if (batchData.rrule) {
      const validation = validateRRule(batchData.rrule);
      if (!validation.valid) {
        return res.status(400).json({ code: 'INVALID_RRULE', message: validation.error });
      }
    }

    // Check for schedule conflicts
    const existingBatches = await Batch.find({
      locationId: batchData.locationId,
      status: { $in: ['upcoming', 'ongoing'] },
    });

    for (const existingBatch of existingBatches) {
      if (hasScheduleConflict(batchData, existingBatch)) {
        return res.status(400).json({
          code: 'SCHEDULE_CONFLICT',
          message: `Schedule conflict with batch: ${existingBatch.name}`,
        });
      }
    }

    const batch = await Batch.create(batchData);

    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    next(error);
  }
};

exports.updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate RRULE if provided
    if (updates.rrule) {
      const validation = validateRRule(updates.rrule);
      if (!validation.valid) {
        return res.status(400).json({ code: 'INVALID_RRULE', message: validation.error });
      }
    }

    const batch = await Batch.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!batch) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found' });
    }

    res.json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    next(error);
  }
};

exports.deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findByIdAndDelete(id);

    if (!batch) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found' });
    }

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    next(error);
  }
};

