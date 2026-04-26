const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const { catchAsync } = require('../utils/AppError');

/**
 * DASHBOARD DATA LOADER
 * This is the main engine for the user dashboard. 
 * We use Promise.all to fire off multiple DB queries at once for speed.
 */
const getDashboard = catchAsync(async (req, res, next) => {
  // Grab the user ID from our auth middleware
  const currentUserId = req.user._id;

  try {
    // We're fetching stats, recent work, and tag progress all at once
    const [userData, recentSubmissions, rawTagData] = await Promise.all([
      User.findById(currentUserId),
      
      // Get the last 5 things the user worked on
      Submission.find({ user: currentUserId })
        .populate('question', 'title slug difficulty tags')
        .sort({ createdAt: -1 })
        .limit(5),
        
      // This is for the "Strongest Topics" chart - counting solved problems per tag
      Submission.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(currentUserId), status: 'accepted' } },
        { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $unwind: '$q.tags' },
        { $group: { _id: '$q.tags', solvedCount: { $sum: 1 } } },
        { $sort: { solvedCount: -1 } },
      ]),
    ]);

    if (!userData) {
      console.log(`[Dashboard] User not found: ${currentUserId}`);
      return res.status(404).json({ success: false, message: "Whoops, user not found!" });
    }

    // Recommendation logic: find the first problem they haven't touched yet
    const nextChallenge = await Question.findOne({
      _id: { $nin: userData.solvedProblems || [] }
    }).select('title slug difficulty tags');

    // Send everything back in a neat package for the frontend
    res.status(200).json({
      success: true,
      stats: userData.stats || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 },
      streak: userData.streak || { current: 0, longest: 0 },
      score: userData.score || 0,
      accuracy: userData.accuracy || 0,
      recentSubmissions: recentSubmissions || [],
      tagProgress: rawTagData || [],
      recommendedProblem: nextChallenge
    });

  } catch (error) {
    // Log the actual error for our own debugging
    console.error('--- DASHBOARD DATA ERROR ---');
    console.error(error.stack);
    res.status(500).json({ success: false, message: "Couldn't load your dashboard. Please try again in a bit!" });
  }
});

// GET /api/users/profile/:userId
const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('-notifications');
  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({ success: true, user });
});

// POST /api/users/bookmarks/:questionId
const toggleBookmark = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const qId = req.params.questionId;

  const isBookmarked = user.bookmarks.includes(qId);

  if (isBookmarked) {
    user.bookmarks.pull(qId);
  } else {
    user.bookmarks.push(qId);
  }
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    bookmarked: !isBookmarked,
    message: isBookmarked ? 'Bookmark removed.' : 'Question bookmarked.',
  });
});

// GET /api/users/bookmarks
const getBookmarks = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'bookmarks',
    'title slug difficulty tags acceptanceRate'
  );

  res.status(200).json({ success: true, bookmarks: user.bookmarks });
});

// GET /api/users/leaderboard
const getLeaderboard = catchAsync(async (req, res) => {
  const users = await User.find()
    .select('name avatar score stats streak')
    .sort({ score: -1 })
    .limit(50);

  const ranked = users.map((u, i) => ({ rank: i + 1, ...u.toJSON() }));

  res.status(200).json({ success: true, leaderboard: ranked });
});

// PATCH /api/users/streak — call this on each user login/activity
const updateStreak = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.streak.lastActiveDate
    ? new Date(user.streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day — extend streak
      user.streak.current += 1;
      user.streak.longest = Math.max(user.streak.current, user.streak.longest);
    } else if (diffDays > 1) {
      // Streak broken
      user.streak.current = 1;
    }
    // diffDays === 0 means already updated today, do nothing
  } else {
    user.streak.current = 1;
  }

  user.streak.lastActiveDate = today;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, streak: user.streak });
});

// GET /api/users/notifications
const getNotifications = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');

  res.status(200).json({
    success: true,
    notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt),
  });
});

// PATCH /api/users/notifications/read
const markNotificationsRead = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { 'notifications.$[].read': true } }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
});

module.exports = {
  getDashboard,
  getUserProfile,
  toggleBookmark,
  getBookmarks,
  getLeaderboard,
  updateStreak,
  getNotifications,
  markNotificationsRead,
};
