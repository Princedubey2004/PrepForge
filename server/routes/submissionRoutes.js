const express = require('express');
const router = express.Router();
const { submitCode, getMySubmissions, getSubmissionById } = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', submitCode);
router.get('/my', getMySubmissions);
router.get('/:id', getSubmissionById);

module.exports = router;
