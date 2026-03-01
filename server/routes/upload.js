const express = require('express');
const multer = require('multer');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const router = express.Router();

// Helper to extract text from PDF buffer
async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result;
}

// Configure storage for covers
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'covers'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato. Usa JPEG, PNG, WebP o GIF.'), false);
  }
};

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// PDF upload - stored in memory for text extraction
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato. Usa solo PDF.'), false);
  }
};

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

// Upload cover image
router.post('/cover', uploadCover.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }

  const imageUrl = `/uploads/covers/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Upload PDF and extract text
router.post('/pdf', uploadPdf.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }

  try {
    const result = await extractPdfText(req.file.buffer);
    
    // Clean up the extracted text
    let text = result.text || '';
    
    // Normalize whitespace: collapse multiple spaces/tabs into one
    text = text.replace(/[ \t]+/g, ' ');
    
    // Normalize line breaks: collapse 3+ newlines into 2 (paragraph break)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim each line
    text = text.split('\n').map(line => line.trim()).join('\n');
    
    // Remove leading/trailing whitespace
    text = text.trim();

    if (!text) {
      return res.status(400).json({ 
        error: 'Impossibile estrarre il testo dal PDF. Potrebbe essere un PDF con solo immagini.' 
      });
    }

    res.json({
      text,
      pages: result.total,
      info: {}
    });
  } catch (error) {
    console.error('Errore parsing PDF:', error);
    res.status(500).json({ error: 'Errore nell\'elaborazione del PDF.' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Il file è troppo grande.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
