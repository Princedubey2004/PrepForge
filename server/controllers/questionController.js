const Question = require('../models/Question');
const { AppError, catchAsync } = require('../utils/AppError');

// Adapted your createQuestion logic to CommonJS
const createQuestion = async (req, res) => {
  const q = await Question.create({ ...req.body, createdBy: req.user?._id });
  res.json(q);
};

// Adapted your getQuestions logic to CommonJS
const getQuestions = async (req, res) => {
  try {
    const { difficulty, limit } = req.query;
    
    // Build query object
    const queryObj = {};
    if (difficulty) queryObj.difficulty = difficulty;
    
    // Execute query with optional limit
    let query = Question.find(queryObj);
    if (limit) query = query.limit(parseInt(limit));
    
    const questions = await query;
    
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Retaining this endpoint because the Code Workspace UI heavily depends on finding a question by its slug!
const getQuestionBySlug = catchAsync(async (req, res, next) => {
  const isAdmin = req.user?.role === 'admin';
  const projection = isAdmin ? {} : { 'testCases.isHidden': 0 };

  const question = await Question.findOne({ slug: req.params.slug }, projection);
  if (!question) {
    return next(new AppError('Question not found.', 404));
  }

  res.status(200).json({ success: true, question });
});

// Retaining the remaining essential routes
const getDailyChallenge = catchAsync(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const question = await Question.findOne({
    isDailyChallenge: true,
    dailyChallengeDate: { $gte: today },
  }).select('-testCases');

  if (!question) {
    return next(new AppError('No daily challenge set for today.', 404));
  }

  res.status(200).json({ success: true, question });
});

const updateQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return next(new AppError('Question not found.', 404));

  res.status(200).json({ success: true, question });
});

const deleteQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return next(new AppError('Question not found.', 404));

  res.status(200).json({ success: true, message: 'Question deleted.' });
});

const setDailyChallenge = catchAsync(async (req, res, next) => {
  const { date } = req.body;
  await Question.updateMany({ isDailyChallenge: true }, { isDailyChallenge: false, dailyChallengeDate: null });

  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isDailyChallenge: true, dailyChallengeDate: date || new Date() },
    { new: true }
  );

  if (!question) return next(new AppError('Question not found.', 404));

  res.status(200).json({ success: true, question });
});

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionBySlug,
  getDailyChallenge,
  updateQuestion,
  deleteQuestion,
  setDailyChallenge,
};
