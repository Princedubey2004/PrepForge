const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitResponse,
  completeInterview,
  getMyInterviews,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startInterview);
router.get('/my', getMyInterviews);
router.patch('/:id/respond', submitResponse);
router.patch('/:id/complete', completeInterview);

module.exports = router;
