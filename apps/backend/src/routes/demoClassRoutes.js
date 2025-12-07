const express = require('express');
const router = express.Router();
const demoClassController = require('../controllers/demoClassController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', demoClassController.getAllDemoClasses);
router.get('/:id', optionalAuth, demoClassController.getDemoClassById);

// Authenticated routes
router.post('/:id/register', authenticate, demoClassController.registerForDemoClass);
router.get('/user/registrations', authenticate, demoClassController.getUserRegistrations);
router.post('/:id/cancel', authenticate, demoClassController.cancelRegistration);

// Admin routes
router.get('/admin/stats', authenticate, authorize('admin', 'instructor'), demoClassController.getRegistrationStats);
router.get('/admin/registrations', authenticate, authorize('admin', 'instructor'), demoClassController.getPendingRegistrations);
router.post('/admin/registrations/:id/approve', authenticate, authorize('admin', 'instructor'), demoClassController.approveRegistration);
router.post('/admin/registrations/:id/reject', authenticate, authorize('admin', 'instructor'), demoClassController.rejectRegistration);

// Admin/Instructor routes
router.post('/', authenticate, authorize('instructor', 'admin'), demoClassController.createDemoClass);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), demoClassController.updateDemoClass);
router.delete('/:id', authenticate, authorize('admin'), demoClassController.deleteDemoClass);

module.exports = router;

