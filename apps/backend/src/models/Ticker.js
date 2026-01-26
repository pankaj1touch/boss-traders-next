const mongoose = require('mongoose');

const tickerSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        change: {
            type: String,
            trim: true,
        },
        isPositive: {
            type: Boolean,
            default: true,
        },
        icon: {
            type: String,
            default: 'TrendingUp', // Default icon name
            trim: true,
        },
        badge: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for active tickers
tickerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Ticker', tickerSchema);
