const mongoose = require('mongoose');

// Note schema — one note per user per question
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
  },
  { timestamps: true }
);

// Only one note per user per question
noteSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
