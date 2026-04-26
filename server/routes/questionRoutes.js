const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getDailyChallenge,
  getQuestionBySlug,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  setDailyChallenge,
} = require('../controllers/questionController');
const { protect, restrictTo } = require('../middleware/auth');

// Public — anyone can browse questions
router.get('/', getQuestions);
router.get('/daily', getDailyChallenge);
router.get('/:slug', getQuestionBySlug);

// Admin-only mutation routes
router.use(protect, restrictTo('admin'));
router.post('/', createQuestion);
router.patch('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.patch('/:id/daily', setDailyChallenge);

module.exports = router;
