const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/AppError');

// Adapted your submitCode logic to CommonJS
const submitCode = catchAsync(async (req, res) => {
  const { code, questionId, language = 'javascript' } = req.body;

  // Your Mock evaluation logic
  // Note: I changed "passed" to "accepted" because the frontend UI specifically checks 
  // for the exact string 'accepted' to show the green success checkmark!
  const status = code.includes("return") ? "accepted" : "failed";

  // Mapped userId/questionId to user/question to match the schema requirements for .populate()
  const submission = await Submission.create({
    user: req.user._id, // Using _id since we mapped it in the auth middleware
    question: questionId,
    code,
    language,
    status
  });

  // Small addition to keep the dashboard stats alive
  if (status === 'accepted') {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalSubmissions': 1, 'stats.acceptedSubmissions': 1, 'stats.totalSolved': 1, 'score': 10 },
      $addToSet: { solvedProblems: questionId }
    });
  }

  res.json({ status, submission });
});

// Retaining this so the User Dashboard's "Recent Submissions" list works
const getMySubmissions = catchAsync(async (req, res) => {
  const { questionId, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (questionId) filter.question = questionId;

  const submissions = await Submission.find(filter)
    .populate('question', 'title slug difficulty')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, submissions });
});

// Retaining this for viewing submission details
const getSubmissionById = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id).populate('question', 'title slug');

  if (!submission) return next(new AppError('Submission not found.', 404));

  if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  res.status(200).json({ success: true, submission });
});

module.exports = { submitCode, getMySubmissions, getSubmissionById };
