import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
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
        type: String,
        default: '',
      },
      currentYear: {
        type: String,
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

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
