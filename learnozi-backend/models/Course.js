const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    name: {
      type: String, // e.g., "Introduction to Physics"
      required: true,
      trim: true,
    },
    code: {
      type: String, // e.g., "PHY101"
      required: true,
      trim: true,
      uppercase: true,
    },
    creditHours: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      default: 3,
    },
    targetGrade: {
      type: String, // e.g., "A", "B+", "A-"
      trim: true,
    },
    actualGrade: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
