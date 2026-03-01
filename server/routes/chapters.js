const express = require('express');
const router = express.Router();
const { Chapter, Book } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Get chapters for a book
router.get('/book/:bookId', asyncHandler(async (req, res) => {
  const chapters = await Chapter.find({ bookId: req.params.bookId })
    .sort({ order: 1 });
  res.json(chapters);
}));

// Get single chapter
router.get('/:id', asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  
  if (!chapter) {
    return res.status(404).json({ error: 'Capitolo non trovato' });
  }
  
  res.json(chapter);
}));

// Create new chapter
router.post('/book/:bookId', asyncHandler(async (req, res) => {
  const { title, content, order } = req.body;
  const { bookId } = req.params;
  
  if (!title) {
    return res.status(400).json({ error: 'Il titolo è obbligatorio' });
  }
  
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  // Calculate order if not provided
  let chapterOrder = order;
  if (chapterOrder === undefined) {
    const maxOrder = await Chapter.findOne({ bookId })
      .sort({ order: -1 })
      .select('order');
    chapterOrder = maxOrder ? maxOrder.order + 1 : 1;
  }
  
  const chapter = await Chapter.create({
    bookId,
    title,
    content,
    order: chapterOrder
  });
  
  // Update book's updatedAt
  book.updatedAt = new Date();
  await book.save();
  
  res.status(201).json(chapter);
}));

// Update chapter
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, content, order } = req.body;
  
  const chapter = await Chapter.findByIdAndUpdate(
    req.params.id,
    { title, content, order },
    { new: true, runValidators: true }
  );
  
  if (!chapter) {
    return res.status(404).json({ error: 'Capitolo non trovato' });
  }
  
  // Update book's updatedAt
  await Book.findByIdAndUpdate(chapter.bookId, { updatedAt: new Date() });
  
  res.json(chapter);
}));

// Delete chapter
router.delete('/:id', asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndDelete(req.params.id);
  
  if (!chapter) {
    return res.status(404).json({ error: 'Capitolo non trovato' });
  }
  
  // Update book's updatedAt
  await Book.findByIdAndUpdate(chapter.bookId, { updatedAt: new Date() });
  
  res.status(204).send();
}));

// Reorder chapters
router.put('/book/:bookId/reorder', asyncHandler(async (req, res) => {
  const { chapters } = req.body; // Array of { id, order }
  
  await Promise.all(
    chapters.map(({ id, order }) =>
      Chapter.findByIdAndUpdate(id, { order })
    )
  );
  
  const updatedChapters = await Chapter.find({ bookId: req.params.bookId })
    .sort({ order: 1 });
  
  res.json(updatedChapters);
}));

module.exports = router;
