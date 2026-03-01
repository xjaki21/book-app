const express = require('express');
const router = express.Router();
const { Book, Chapter, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all books with filters
router.get('/', asyncHandler(async (req, res) => {
  const { genre, status, sort, search, limit = 20, page = 1 } = req.query;
  
  const query = {};
  
  if (genre) query.genre = genre;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  let sortOption = { createdAt: -1 };
  if (sort === 'popular') sortOption = { views: -1 };
  if (sort === 'likes') sortOption = { likes: -1 };
  if (sort === 'title') sortOption = { title: 1 };
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const books = await Book.find(query)
    .populate('authorId', 'username name avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  // Get chapters count for each book
  const booksWithCount = await Promise.all(
    books.map(async (book) => {
      const chaptersCount = await Chapter.countDocuments({ bookId: book._id });
      return {
        ...book,
        author: book.authorId,
        chaptersCount
      };
    })
  );
  
  const total = await Book.countDocuments(query);
  
  res.json({
    books: booksWithCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// Get trending books
router.get('/trending', asyncHandler(async (req, res) => {
  const books = await Book.find()
    .populate('authorId', 'username name avatar')
    .sort({ views: -1, likes: -1 })
    .limit(10)
    .lean();
  
  const booksWithCount = await Promise.all(
    books.map(async (book) => {
      const chaptersCount = await Chapter.countDocuments({ bookId: book._id });
      return { ...book, author: book.authorId, chaptersCount };
    })
  );
  
  res.json(booksWithCount);
}));

// Get popular books
router.get('/popular', asyncHandler(async (req, res) => {
  const books = await Book.find()
    .populate('authorId', 'username name avatar')
    .sort({ likes: -1 })
    .limit(10)
    .lean();
  
  const booksWithCount = await Promise.all(
    books.map(async (book) => {
      const chaptersCount = await Chapter.countDocuments({ bookId: book._id });
      return { ...book, author: book.authorId, chaptersCount };
    })
  );
  
  res.json(booksWithCount);
}));

// Get recently updated books
router.get('/recent', asyncHandler(async (req, res) => {
  const books = await Book.find()
    .populate('authorId', 'username name avatar')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();
  
  const booksWithCount = await Promise.all(
    books.map(async (book) => {
      const chaptersCount = await Chapter.countDocuments({ bookId: book._id });
      return { ...book, author: book.authorId, chaptersCount };
    })
  );
  
  res.json(booksWithCount);
}));

// Get book by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('authorId', 'username name avatar bio');
  
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  // Increment views
  book.views += 1;
  await book.save();
  
  const chapters = await Chapter.find({ bookId: book._id })
    .sort({ order: 1 });
  
  res.json({
    ...book.toObject(),
    author: book.authorId,
    chapters
  });
}));

// Create new book
router.post('/', asyncHandler(async (req, res) => {
  const { title, description, authorId, coverImage, genre, status, tags } = req.body;
  
  if (!title || !authorId) {
    return res.status(400).json({ error: 'Titolo e autore sono obbligatori' });
  }
  
  const book = await Book.create({
    title,
    description,
    authorId,
    coverImage,
    genre,
    status,
    tags
  });
  
  const populatedBook = await Book.findById(book._id)
    .populate('authorId', 'username name avatar');
  
  res.status(201).json(populatedBook);
}));

// Update book
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, description, coverImage, genre, status, tags } = req.body;
  
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { title, description, coverImage, genre, status, tags },
    { new: true, runValidators: true }
  ).populate('authorId', 'username name avatar');
  
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  res.json(book);
}));

// Like book
router.post('/:id/like', asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  res.json({ likes: book.likes });
}));

// Delete book
router.delete('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }
  
  // Delete associated chapters
  await Chapter.deleteMany({ bookId: req.params.id });
  
  res.status(204).send();
}));

module.exports = router;
