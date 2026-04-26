const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  
  // Retaining the fields needed for the platform features (Dashboard, Stats, Mock Interviews)
  // to ensure the application doesn't break.
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
  },
  stats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
  },
  score: { type: Number, default: 0, index: true },
  notifications: [
    {
      message: String,
      type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
}, { timestamps: true });

// Compute accuracy percentage on the fly
userSchema.virtual('accuracy').get(function () {
  if (!this.stats || this.stats.totalSubmissions === 0) return 0;
  return Math.round((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100);
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("User", userSchema);
