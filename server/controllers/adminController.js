const User = require('../models/User');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { catchAsync } = require('../utils/AppError');

// GET /api/admin/stats — high-level platform analytics
const getPlatformStats = catchAsync(async (req, res) => {
  const [totalUsers, totalQuestions, totalSubmissions, recentUsers] = await Promise.all([
    User.countDocuments(),
    Question.countDocuments(),
    Submission.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
  ]);

  // Submissions per day for the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const submissionTrend = await Submission.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: { totalUsers, totalQuestions, totalSubmissions },
    recentUsers,
    submissionTrend,
  });
});

// GET /api/admin/users
const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const users = await User.find()
    .select('-notifications')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, users });
});

// PATCH /api/admin/users/:id/role
const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({ success: true, user });
});

module.exports = { getPlatformStats, getAllUsers, updateUserRole };
