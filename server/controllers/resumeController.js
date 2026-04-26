const ResumeAnalysis = require('../models/ResumeAnalysis');
const resumeService = require('../services/resumeService');
const { AppError, catchAsync } = require('../utils/AppError');

// POST /api/resume/analyze
const analyzeResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a PDF resume.', 400));
  }

  const targetRole = req.body.targetRole || 'Software Engineer';

  // Create a pending record — the UI can poll this or we respond when done
  const record = await ResumeAnalysis.create({
    user: req.user._id,
    fileName: req.file.originalname,
    status: 'processing',
    targetRole,
  });

  // Extract and analyze (this can take a few seconds)
  try {
    const analysis = await resumeService.extractAndAnalyze(req.file.buffer, targetRole);

    // Update the record with results
    Object.assign(record, analysis, { status: 'completed' });
    await record.save();
  } catch (err) {
    record.status = 'failed';
    await record.save();
    return next(new AppError('Failed to analyze resume. Please try again.', 500));
  }

  res.status(200).json({ success: true, analysis: record });
});

// GET /api/resume/history
const getResumeHistory = catchAsync(async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user._id })
    .select('-extractedText') // extractedText is large; skip it in the list
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({ success: true, analyses });
});

// GET /api/resume/:id
const getResumeAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await ResumeAnalysis.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!analysis) return next(new AppError('Analysis not found.', 404));

  res.status(200).json({ success: true, analysis });
});

module.exports = { analyzeResume, getResumeHistory, getResumeAnalysis };
