const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

// All routes below require a valid JWT
router.use(protect);
router.get('/me', getMe);
router.patch('/update-profile', updateProfile);
router.patch('/change-password', changePassword);

module.exports = router;
