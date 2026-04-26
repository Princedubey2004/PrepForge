const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  // Your requested core fields
  title: String,
  description: String,
  difficulty: String,
  tags: [String],
  testCases: [{ 
    input: String, 
    output: String, // Note: The judge engine expects 'expectedOutput', so I will map it below or in the service
    expectedOutput: String, // Kept to avoid breaking the execution engine
    isHidden: { type: Boolean, default: false }
  }],

  // Retaining these fields to prevent the application UI and Routing from breaking
  slug: { type: String, unique: true, lowercase: true },
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    },
  ],
  starterCode: {
    javascript: { type: String, default: '// Write your solution here\n' },
    python: { type: String, default: '# Write your solution here\n' },
    cpp: { type: String, default: '// Write your solution here\n' },
  },
  totalSubmissions: { type: Number, default: 0 },
  totalAccepted: { type: Number, default: 0 },
  points: { type: Number, default: 10 },
  isDailyChallenge: { type: Boolean, default: false },
  dailyChallengeDate: { type: Date, default: null },
}, { timestamps: true });

// Auto-generate slug from title before saving so routes like /problems/two-sum work
questionSchema.pre('save', function (next) {
  if (this.isModified('title') && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model("Question", questionSchema);
