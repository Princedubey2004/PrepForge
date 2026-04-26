const express = require('express');
const { signup, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { 
  createQuestion, 
  getQuestions, 
  getQuestionBySlug,
  getDailyChallenge,
  updateQuestion,
  deleteQuestion,
  setDailyChallenge 
} = require('../controllers/questionController');
const { submitCode, getMySubmissions, getSubmissionById } = require('../controllers/submissionController');

// Importing other controllers to keep the app fully functional
const { getDashboard, getUserProfile, toggleBookmark, getBookmarks, getLeaderboard, updateStreak, getNotifications, markNotificationsRead } = require('../controllers/userController');
const { analyzeResume, getResumeHistory, getResumeAnalysis } = require('../controllers/resumeController');
const { startInterview, submitResponse, completeInterview, getMyInterviews } = require('../controllers/interviewController');
const { getNoteForQuestion, saveNote, deleteNote } = require('../controllers/noteController');
const { getPlatformStats, getAllUsers, updateUserRole } = require('../controllers/adminController');

const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// --- Your Requested Routes (Adapted to CommonJS) ---
router.post('/auth/signup', signup);
router.post('/auth/login', login);

// Note: I made getQuestions protected as per your snippet!
router.post('/questions', protect, createQuestion);
router.get('/questions', protect, getQuestions);

// Note: I mapped '/submit' to '/submissions' to prevent the frontend from crashing, 
// as the React code expects api.post('/submissions')
router.post('/submissions', protect, submitCode);

// --- Retained Routes for the rest of the application ---

// Auth (Extended)
router.get('/auth/me', protect, getMe);
router.patch('/auth/update-profile', protect, updateProfile);
router.patch('/auth/change-password', protect, changePassword);

// Questions (Extended)
router.get('/questions/daily', protect, getDailyChallenge);
router.get('/questions/:slug', protect, getQuestionBySlug); // Required for code editor
router.patch('/questions/:id', protect, updateQuestion);
router.delete('/questions/:id', protect, deleteQuestion);
router.patch('/questions/:id/daily', protect, setDailyChallenge);

// Submissions (Extended)
router.get('/submissions/my', protect, getMySubmissions);
router.get('/submissions/:id', protect, getSubmissionById);

// Users
router.get('/users/leaderboard', getLeaderboard);
router.get('/users/profile/:userId', getUserProfile);
router.get('/users/dashboard', protect, getDashboard);
router.get('/users/bookmarks', protect, getBookmarks);
router.post('/users/bookmarks/:questionId', protect, toggleBookmark);
router.patch('/users/streak', protect, updateStreak);
router.get('/users/notifications', protect, getNotifications);
router.patch('/users/notifications/read', protect, markNotificationsRead);

// Resume Analysis
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/resume/analyze', protect, upload.single('resume'), analyzeResume);
router.get('/resume/history', protect, getResumeHistory);
router.get('/resume/:id', protect, getResumeAnalysis);

// Mock Interviews
router.post('/interviews/start', protect, startInterview);
router.get('/interviews/my', protect, getMyInterviews);
router.patch('/interviews/:id/respond', protect, submitResponse);
router.patch('/interviews/:id/complete', protect, completeInterview);

// Notes
router.get('/notes/:questionId', protect, getNoteForQuestion);
router.put('/notes/:questionId', protect, saveNote);
router.delete('/notes/:questionId', protect, deleteNote);

// Admin
router.get('/admin/stats', protect, restrictTo('admin'), getPlatformStats);
router.get('/admin/users', protect, restrictTo('admin'), getAllUsers);
router.patch('/admin/users/:id/role', protect, restrictTo('admin'), updateUserRole);

module.exports = router;
