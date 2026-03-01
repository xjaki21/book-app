const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ReadingList, Book, Chapter } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Get user's reading list
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const query = { userId: req.params.userId };
  if (status) query.status = status;
  
  const entries = await ReadingList.find(query)
    .populate({
      path: 'bookId',
      populate: {
        path: 'authorId',
        select: 'username name avatar'
      }
    })
    .sort({ updatedAt: -1 });
  
  const entriesWithDetails = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.bookId) return null;
      const chaptersCount = await Chapter.countDocuments({ bookId: entry.bookId._id });
      return {
        ...entry.toObject(),
        book: {
          ...entry.bookId.toObject(),
          author: entry.bookId.authorId,
          chaptersCount
        }
      };
    })
  );
  
  res.json(entriesWithDetails.filter(e => e !== null));
}));

// Get reading list stats for user
router.get('/user/:userId/stats', asyncHandler(async (req, res) => {
  const stats = await ReadingList.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.params.userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    planning: 0,
    reading: 0,
    completed: 0,
    dropped: 0,
    paused: 0,
    total: 0
  };
  
  stats.forEach(s => {
    result[s._id] = s.count;
    result.total += s.count;
  });
  
  res.json(result);
}));

// Add book to reading list
router.post('/', asyncHandler(async (req, res) => {
  const { userId, bookId, status = 'planning' } = req.body;
  
  if (!userId || !bookId) {
    return res.status(400).json({ error: 'userId e bookId sono obbligatori' });
  }
  
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  // Check if already exists
  const existing = await ReadingList.findOne({ userId, bookId });
  if (existing) {
    return res.status(400).json({ error: 'Libro già nella lista lettura' });
  }
  
  const entry = await ReadingList.create({
    userId,
    bookId,
    status,
    startedAt: status === 'reading' ? new Date() : null
  });
  
  res.status(201).json(entry);
}));

// Update reading list entry
router.put('/:id', asyncHandler(async (req, res) => {
  const { status, progress, score, notes } = req.body;
  
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (progress !== undefined) updateData.progress = progress;
  if (score !== undefined) updateData.score = score;
  if (notes !== undefined) updateData.notes = notes;
  
  // Set timestamps based on status
  if (status === 'reading' && !updateData.startedAt) {
    updateData.startedAt = new Date();
  }
  if (status === 'completed') {
    updateData.completedAt = new Date();
  }
  
  const entry = await ReadingList.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate({
    path: 'bookId',
    populate: {
      path: 'authorId',
      select: 'username name avatar'
    }
  });
  
  if (!entry) {
    return res.status(404).json({ error: 'Voce non trovata' });
  }
  
  res.json(entry);
}));

// Remove from reading list
router.delete('/:id', asyncHandler(async (req, res) => {
  const entry = await ReadingList.findByIdAndDelete(req.params.id);
  
  if (!entry) {
    return res.status(404).json({ error: 'Voce non trovata' });
  }
  
  res.status(204).send();
}));

// Check if book is in user's reading list
router.get('/check/:userId/:bookId', asyncHandler(async (req, res) => {
  const entry = await ReadingList.findOne({
    userId: req.params.userId,
    bookId: req.params.bookId
  });
  
  res.json({
    inList: !!entry,
    entry: entry || null
  });
}));

module.exports = router;
