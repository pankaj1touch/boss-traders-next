const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', authenticate, authorize('admin'), locationController.createLocation);
router.patch('/:id', authenticate, authorize('admin'), locationController.updateLocation);
router.delete('/:id', authenticate, authorize('admin'), locationController.deleteLocation);

module.exports = router;

