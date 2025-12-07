const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route - get instructors (for dropdowns)
router.get('/instructors', userController.getInstructors);

// Admin routes
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

module.exports = router;

