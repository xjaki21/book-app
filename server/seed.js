require('dotenv').config();
const mongoose = require('mongoose');
const { User, Book, Chapter } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-community';

const sampleBooks = [
  {
    title: 'Il Viaggio dell\'Eroe',
    description: 'Un\'epica avventura attraverso terre sconosciute alla ricerca del proprio destino.',
    genre: 'fantasy',
    status: 'ongoing',
    tags: ['avventura', 'magia', 'epico'],
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    views: 1250,
    likes: 89
  },
  {
    title: 'Cuori in Tempesta',
    description: 'Una storia d\'amore intensa tra due anime destinate a incontrarsi.',
    genre: 'romance',
    status: 'completed',
    tags: ['amore', 'drama', 'contemporaneo'],
    coverImage: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=600&fit=crop',
    views: 2100,
    likes: 156
  },
  {
    title: 'L\'Ultimo Codice',
    description: 'Un thriller tecnologico che esplora i confini dell\'intelligenza artificiale.',
    genre: 'thriller',
    status: 'ongoing',
    tags: ['tecnologia', 'suspense', 'AI'],
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop',
    views: 890,
    likes: 67
  },
  {
    title: 'Ombre nel Silenzio',
    description: 'Misteriosi eventi scuotono una piccola città di provincia.',
    genre: 'mystery',
    status: 'completed',
    tags: ['mistero', 'investigazione', 'suspense'],
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    views: 1560,
    likes: 112
  },
  {
    title: 'Stelle Oltre l\'Orizzonte',
    description: 'Un viaggio interstellare alla scoperta di nuovi mondi e civiltà.',
    genre: 'sci-fi',
    status: 'ongoing',
    tags: ['spazio', 'futuro', 'esplorazione'],
    coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop',
    views: 780,
    likes: 54
  },
  {
    title: 'La Casa dei Sussurri',
    description: 'Una famiglia si trasferisce in una vecchia dimora con oscuri segreti.',
    genre: 'horror',
    status: 'completed',
    tags: ['paura', 'soprannaturale', 'famiglia'],
    coverImage: 'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=400&h=600&fit=crop',
    views: 1890,
    likes: 134
  }
];

const generateChapters = (bookTitle) => {
  const chapters = [];
  const numChapters = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 1; i <= numChapters; i++) {
    chapters.push({
      title: `Capitolo ${i}`,
      content: `Questo è il contenuto del capitolo ${i} del libro "${bookTitle}".\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
      order: i
    });
  }
  
  return chapters;
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Database già popolato, seed ignorato.');
      process.exit(0);
    }
    
    // Create demo user
    const user = await User.create({
      username: 'demo',
      name: 'Utente Demo',
      email: 'demo@example.com',
      password: 'demo123',
      bio: 'Appassionato di lettura e scrittura.',
      avatar: ''
    });
    console.log('Created demo user:', user._id);
    
    // Create books with chapters
    for (const bookData of sampleBooks) {
      const book = await Book.create({
        ...bookData,
        authorId: user._id
      });
      
      const chaptersData = generateChapters(book.title).map(ch => ({
        ...ch,
        bookId: book._id
      }));
      
      await Chapter.insertMany(chaptersData);
      console.log(`Created book "${book.title}" with ${chaptersData.length} chapters`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`\nDemo User:`);
    console.log(`  Email: demo@example.com`);
    console.log(`  Password: demo123`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
