const Location = require('../models/Location');

exports.getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ isActive: true }).sort('name');

    res.json({ locations });
  } catch (error) {
    next(error);
  }
};

exports.getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Location not found' });
    }

    res.json({ location });
  } catch (error) {
    next(error);
  }
};

exports.createLocation = async (req, res, next) => {
  try {
    const locationData = req.body;

    const location = await Location.create(locationData);

    res.status(201).json({ message: 'Location created successfully', location });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const location = await Location.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!location) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully', location });
  } catch (error) {
    next(error);
  }
};

exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
};

