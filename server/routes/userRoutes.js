const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUserProfile,
  toggleBookmark,
  getBookmarks,
  getLeaderboard,
  updateStreak,
  getNotifications,
  markNotificationsRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Leaderboard is public — useful for the landing page
router.get('/leaderboard', getLeaderboard);
router.get('/profile/:userId', getUserProfile);

// Everything below needs auth
router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:questionId', toggleBookmark);
router.patch('/streak', updateStreak);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsRead);

module.exports = router;
