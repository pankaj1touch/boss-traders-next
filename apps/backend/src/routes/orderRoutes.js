const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, orderController.createOrder);
router.post('/payment', authenticate, orderController.processPayment);
router.post('/verify-payment', authenticate, orderController.verifyPayment);
router.post('/confirm-payment', authenticate, authorize('admin'), orderController.confirmPayment);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;

