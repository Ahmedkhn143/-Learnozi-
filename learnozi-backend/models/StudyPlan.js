const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
    default: 'pending',
  },
  estimatedMinutes: { type: Number, required: true, min: 5 },
  actualMinutes: { type: Number, default: 0 },
  scheduledDate: { type: Date, required: true },
  completedAt: { type: Date },
});

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
    },
    examDate: { type: Date },
    subjects: [
      {
        name: { type: String, required: true },
        weight: { type: Number, default: 1, min: 1, max: 10 },
      },
    ],
    tasks: [taskSchema],
    isAIGenerated: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: completion %
studyPlanSchema.virtual('progress').get(function () {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const done = this.tasks.filter((t) => t.status === 'completed').length;
  return Math.round((done / this.tasks.length) * 100);
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
