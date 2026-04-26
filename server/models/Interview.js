const mongoose = require('mongoose');

// One interview session = one document here
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['dsa', 'system_design', 'mixed'],
      default: 'dsa',
    },
    // Questions asked during this session (could be DSA or text-based system design)
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        questionText: String, // for system design questions not in our DB
        userResponse: String,
        aiFeedback: String,
        score: { type: Number, min: 0, max: 10, default: 0 },
      },
    ],
    // How long the interview actually ran (seconds)
    duration: { type: Number, default: 0 },
    // Overall AI-generated feedback for the full session
    overallFeedback: { type: String, default: '' },
    overallScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
