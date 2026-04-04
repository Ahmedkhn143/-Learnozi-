const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: 100,
    },
    color: {
      type: String,
      default: '#4f46e5',
      match: [/^#([0-9A-Fa-f]{6})$/, 'Invalid hex color'],
    },
    topics: [
      {
        title: { type: String, required: true, trim: true },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One user can't have duplicate subject names
subjectSchema.index({ user: 1, name: 1 }, { unique: true });

// Cascade delete: remove exams & schedules that reference this subject
subjectSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    const mongoose = require('mongoose');
    await mongoose.model('Exam').deleteMany({ subject: doc._id });
    // Pull sessions referencing this subject from user schedules
    await mongoose.model('Schedule').updateMany(
      { user: doc.user },
      { $pull: { sessions: { subject: doc._id } } }
    );
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
