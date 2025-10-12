const Module = require('../models/Module');
const Course = require('../models/Course');

exports.getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ courseId }).sort('order');

    res.json({ modules });
  } catch (error) {
    next(error);
  }
};

exports.createModule = async (req, res, next) => {
  try {
    const moduleData = req.body;

    const course = await Course.findById(moduleData.courseId);
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found' });
    }

    const module = await Module.create(moduleData);

    res.status(201).json({ message: 'Module created successfully', module });
  } catch (error) {
    next(error);
  }
};

exports.updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const module = await Module.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!module) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Module not found' });
    }

    res.json({ message: 'Module updated successfully', module });
  } catch (error) {
    next(error);
  }
};

exports.deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const module = await Module.findByIdAndDelete(id);

    if (!module) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Module not found' });
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    next(error);
  }
};

