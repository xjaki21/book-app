const mongoose = require('mongoose');

const readingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'reading', 'completed', 'dropped', 'paused'],
    default: 'planning'
  },
  progress: {
    type: Number,
    default: 0  // chapters read
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicates
readingListSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingList', readingListSchema);
