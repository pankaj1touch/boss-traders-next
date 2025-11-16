const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, studentController.getDashboardStats);
router.get('/courses', authenticate, studentController.getMyCourses);
router.get('/ebooks', authenticate, studentController.getMyEbooks);

module.exports = router;

