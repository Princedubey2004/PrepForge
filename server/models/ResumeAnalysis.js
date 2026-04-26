const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Original filename for display purposes
    fileName: { type: String, required: true },
    // Raw extracted text from the PDF
    extractedText: { type: String },
    // AI analysis results
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    // Skills found in the resume
    detectedSkills: [{ type: String }],
    // Skills missing based on target role/market
    skillGaps: [{ type: String }],
    // List of actionable suggestions
    suggestions: [{ type: String }],
    // Keyword match breakdown
    keywordAnalysis: {
      matched: [String],
      missing: [String],
    },
    // Which job role the analysis was targeted at
    targetRole: { type: String, default: 'Software Engineer' },
    // Full AI-generated summary paragraph
    summary: { type: String, default: '' },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
