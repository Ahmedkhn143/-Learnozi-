const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 15, max: 480 },
  completed: { type: Boolean, default: false },
});

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    hoursPerDay: { type: Number, default: 4, min: 1, max: 16 },
    sessions: [sessionSchema],
  },
  { timestamps: true }
);

// Virtual: overall completion percentage
scheduleSchema.virtual('progress').get(function () {
  if (!this.sessions.length) return 0;
  const done = this.sessions.filter((s) => s.completed).length;
  return Math.round((done / this.sessions.length) * 100);
});

scheduleSchema.set('toJSON', { virtuals: true });
scheduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
