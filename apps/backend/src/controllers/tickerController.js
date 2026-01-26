const Ticker = require('../models/Ticker');

// @desc    Get all active tickers
// @route   GET /api/tickers
// @access  Public
exports.getAllTickers = async (req, res) => {
    try {
        const tickers = await Ticker.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tickers.length,
            data: tickers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

// @desc    Get all tickers (Admin)
// @route   GET /api/tickers/admin
// @access  Private/Admin
exports.getAdminTickers = async (req, res) => {
    try {
        const tickers = await Ticker.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tickers.length,
            data: tickers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

// @desc    Create new ticker
// @route   POST /api/tickers
// @access  Private/Admin
exports.createTicker = async (req, res) => {
    try {
        const ticker = await Ticker.create(req.body);
        res.status(201).json({
            success: true,
            data: ticker,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message,
        });
    }
};

// @desc    Update ticker
// @route   PUT /api/tickers/:id
// @access  Private/Admin
exports.updateTicker = async (req, res) => {
    try {
        const ticker = await Ticker.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!ticker) {
            return res.status(404).json({
                success: false,
                message: 'Ticker not found',
            });
        }

        res.status(200).json({
            success: true,
            data: ticker,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message,
        });
    }
};

// @desc    Delete ticker
// @route   DELETE /api/tickers/:id
// @access  Private/Admin
exports.deleteTicker = async (req, res) => {
    try {
        const ticker = await Ticker.findByIdAndDelete(req.params.id);

        if (!ticker) {
            return res.status(404).json({
                success: false,
                message: 'Ticker not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: 'Ticker deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};
