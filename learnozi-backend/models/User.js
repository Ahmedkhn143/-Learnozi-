const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    preferences: {
      studyHoursPerDay: { type: Number, default: 4, min: 1, max: 16 },
      subjects: [{ type: String, trim: true }],
    },

    // ── Email verification ─────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,

    // ── Password reset ─────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,

    // ── Academic Profile ───────────────────────────────────
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    academicProfile: {
      educationLevel: {
        type: String,
        enum: ['Matric', 'Intermediate', 'University', 'TestPrep', null],
        default: null,
      },
      fieldOfStudy: {
        type: String, // e.g., "Pre-Medical", "Computer Science"
        default: '',
      },
      currentYear: {
        type: String, // e.g., "9th", "Semester 3"
        default: '',
      },
      institution: {
        type: String,
        default: '',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
