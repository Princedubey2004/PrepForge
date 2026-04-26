const Interview = require('../models/Interview');
const Question = require('../models/Question');
const interviewService = require('../services/interviewService');
const { AppError, catchAsync } = require('../utils/AppError');

// POST /api/interviews/start — start a new mock interview session
const startInterview = catchAsync(async (req, res) => {
  const { type = 'dsa', questionCount = 5 } = req.body;

  // Pick random questions based on type
  let questions = [];

  if (type === 'dsa' || type === 'mixed') {
    const dsaQuestions = await Question.aggregate([
      { $match: { tags: { $nin: ['system-design'] } } },
      { $sample: { size: type === 'mixed' ? Math.ceil(questionCount / 2) : questionCount } },
      { $project: { title: 1, description: 1, difficulty: 1, tags: 1 } },
    ]);
    questions = [...dsaQuestions.map((q) => ({ questionId: q._id, questionText: q.title }))];
  }

  if (type === 'system_design' || type === 'mixed') {
    const sdQuestions = interviewService.getSystemDesignQuestions(
      type === 'mixed' ? Math.floor(questionCount / 2) : questionCount
    );
    questions = [...questions, ...sdQuestions.map((q) => ({ questionText: q }))];
  }

  const interview = await Interview.create({
    user: req.user._id,
    type,
    questions,
  });

  res.status(201).json({ success: true, interview });
});

// PATCH /api/interviews/:id/respond — user submits a response to a question
const submitResponse = catchAsync(async (req, res, next) => {
  const { questionIndex, response } = req.body;

  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) return next(new AppError('Interview session not found.', 404));

  if (interview.status !== 'in_progress') {
    return next(new AppError('This interview session has already ended.', 400));
  }

  interview.questions[questionIndex].userResponse = response;

  // Optional AI feedback per response
  if (process.env.GEMINI_API_KEY) {
    const qText = interview.questions[questionIndex].questionText;
    const feedback = await interviewService.getAIFeedback(qText, response);
    interview.questions[questionIndex].aiFeedback = feedback.text;
    interview.questions[questionIndex].score = feedback.score;
  }

  await interview.save();

  res.status(200).json({ success: true, question: interview.questions[questionIndex] });
});

// PATCH /api/interviews/:id/complete — end the session
const completeInterview = catchAsync(async (req, res, next) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) return next(new AppError('Interview not found.', 404));

  interview.status = 'completed';
  interview.completedAt = new Date();
  interview.duration = Math.round((new Date() - interview.startedAt) / 1000);

  // Compute overall score from individual question scores
  const scoredQuestions = interview.questions.filter((q) => q.score > 0);
  if (scoredQuestions.length > 0) {
    interview.overallScore = Math.round(
      scoredQuestions.reduce((sum, q) => sum + q.score, 0) / scoredQuestions.length
    );
  }

  await interview.save();

  res.status(200).json({ success: true, interview });
});

// GET /api/interviews/my
const getMyInterviews = catchAsync(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id })
    .select('-questions.userResponse') // keep the list small
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({ success: true, interviews });
});

module.exports = { startInterview, submitResponse, completeInterview, getMyInterviews };
