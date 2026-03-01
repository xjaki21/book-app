const express = require('express');
const router = express.Router();
const { User, Book, ReadingList, Chapter } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri' });
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email già registrata' });
    }
    return res.status(400).json({ error: 'Username già in uso' });
  }
  
  const user = await User.create({
    username,
    email,
    password,
    name
  });
  
  res.status(201).json(user);
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }
  
  res.json(user);
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  
  // Get user stats
  const booksPublished = await Book.countDocuments({ authorId: user._id });
  const readingListCount = await ReadingList.countDocuments({ userId: user._id });
  
  res.json({
    ...user.toJSON(),
    booksPublished,
    readingListCount
  });
}));

// Get user's published books
router.get('/:id/books', asyncHandler(async (req, res) => {
  const books = await Book.find({ authorId: req.params.id })
    .populate('authorId', 'username name avatar')
    .sort({ updatedAt: -1 });
  
  const booksWithCount = await Promise.all(
    books.map(async (book) => {
      const chaptersCount = await Chapter.countDocuments({ bookId: book._id });
      return {
        ...book.toObject(),
        author: book.authorId,
        chaptersCount
      };
    })
  );
  
  res.json(booksWithCount);
}));

// Create user (for demo purposes)
router.post('/', asyncHandler(async (req, res) => {
  const { username, name, email, password, avatar, bio } = req.body;
  
  if (!username || !name) {
    return res.status(400).json({ error: 'Username e nome sono obbligatori' });
  }
  
  const user = await User.create({
    username,
    name,
    email,
    password: password || 'demo123',
    avatar,
    bio
  });
  
  res.status(201).json(user);
}));

// Update user
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, avatar, bio, bannerImage } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, avatar, bio, bannerImage },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  
  res.json(user);
}));

module.exports = router;
