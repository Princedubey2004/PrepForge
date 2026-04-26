const Note = require('../models/Note');
const { AppError, catchAsync } = require('../utils/AppError');

// GET /api/notes/:questionId
const getNoteForQuestion = catchAsync(async (req, res) => {
  const note = await Note.findOne({
    user: req.user._id,
    question: req.params.questionId,
  });

  // Return null note gracefully — the UI shows an empty editor
  res.status(200).json({ success: true, note: note || null });
});

// PUT /api/notes/:questionId — upsert (create or update)
const saveNote = catchAsync(async (req, res) => {
  const { content } = req.body;

  const note = await Note.findOneAndUpdate(
    { user: req.user._id, question: req.params.questionId },
    { content },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, note });
});

// DELETE /api/notes/:questionId
const deleteNote = catchAsync(async (req, res) => {
  await Note.findOneAndDelete({ user: req.user._id, question: req.params.questionId });
  res.status(200).json({ success: true, message: 'Note deleted.' });
});

module.exports = { getNoteForQuestion, saveNote, deleteNote };
