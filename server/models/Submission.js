const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  // Mapping your `userId` and `questionId` to `user` and `question` respectively.
  // This is required because the Dashboard and Problem List APIs rely on Mongoose's 
  // `.populate('question')` method to fetch the problem details for the frontend!
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true,
  },
  
  // Your core fields
  code: String,
  status: String,

  // Retaining the execution engine fields so the Code Editor workspace doesn't crash 
  // when returning Judge0 results (like runtime, memory, and how many tests passed)
  language: {
    type: String,
    enum: ['javascript', 'python', 'cpp'],
    required: true,
  },
  testsPassed: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  runtime: { type: Number, default: 0 }, 
  memory: { type: Number, default: 0 },  
  errorMessage: { type: String, default: '' },
  actualOutput: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
}, { timestamps: true });

// Compound indexes for faster dashboard queries
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ question: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
