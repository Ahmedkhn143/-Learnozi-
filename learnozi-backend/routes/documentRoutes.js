const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  chatDocument,
} = require('../controllers/documentController');

// Multer setup - store files in memory to parse them, max size 15MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// All document routes are protected
router.use(auth);

// Handle file upload and extraction
router.post('/upload', upload.single('document'), uploadDocument);

// Chat with specific document
router.post('/:id/chat', validate(schemas.chatDocument), chatDocument);

// Manage documents
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

// Basic error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
