const mongoose = require('mongoose');

const bookViewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  visitorId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Un utente/visitatore può contare una sola view per libro
bookViewSchema.index({ bookId: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('BookView', bookViewSchema);
