const express = require('express');
const router = express.Router();
const {
  getNoteForQuestion,
  saveNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:questionId', getNoteForQuestion);
router.put('/:questionId', saveNote); // Upsert
router.delete('/:questionId', deleteNote);

module.exports = router;
