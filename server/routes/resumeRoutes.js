const express = require('express');
const multer = require('multer');
const router = express.Router();
const { analyzeResume, getResumeHistory, getResumeAnalysis } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

// Store files in memory — we only need the buffer to pass to pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

router.use(protect);

router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/history', getResumeHistory);
router.get('/:id', getResumeAnalysis);

module.exports = router;
