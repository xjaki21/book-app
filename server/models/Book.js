const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  genre: {
    type: String,
    enum: ['fantasy', 'romance', 'thriller', 'horror', 'sci-fi', 'mystery', 'adventure', 'drama', 'comedy', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for chapters count
bookSchema.virtual('chaptersCount', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'bookId',
  count: true
});

// Ensure virtuals are included in JSON
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// Index for search
bookSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
