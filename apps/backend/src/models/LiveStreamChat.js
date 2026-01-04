const mongoose = require('mongoose');

const liveStreamChatSchema = new mongoose.Schema(
  {
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveStream',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['message', 'question', 'answer', 'system'],
      default: 'message',
    },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveStreamChat',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
liveStreamChatSchema.index({ streamId: 1, createdAt: -1 });
liveStreamChatSchema.index({ userId: 1 });

module.exports = mongoose.model('LiveStreamChat', liveStreamChatSchema);


