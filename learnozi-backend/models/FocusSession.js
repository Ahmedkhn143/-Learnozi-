const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject:     { type: String, default: 'General', trim: true },
    durationMin: { type: Number, required: true, min: 1 },
    completedAt: { type: Date, default: Date.now },
    completed:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);
