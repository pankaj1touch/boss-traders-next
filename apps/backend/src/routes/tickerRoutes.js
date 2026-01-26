const express = require('express');
const router = express.Router();
const {
    getAllTickers,
    getAdminTickers,
    createTicker,
    updateTicker,
    deleteTicker,
} = require('../controllers/tickerController');
const { authenticate, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getAllTickers)
    .post(authenticate, authorize('admin'), createTicker);

router.route('/admin').get(authenticate, authorize('admin'), getAdminTickers);

router
    .route('/:id')
    .put(authenticate, authorize('admin'), updateTicker)
    .delete(authenticate, authorize('admin'), deleteTicker);

module.exports = router;
