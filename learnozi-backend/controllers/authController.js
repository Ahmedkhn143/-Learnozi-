const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// ── POST /api/auth/register ───────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    // Send verification email (don't block response on failure)
    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error('Failed to send verification email:', err.message)
    );

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/verify/:token ───────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Auto-login after verification
    const jwtToken = signToken(user._id);

    res.json({
      message: 'Email verified successfully!',
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/resend-verification ────────────────────
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }

    if (user.isVerified) {
      return res.json({ message: 'Email is already verified. You can log in.' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error('Failed to send verification email:', err.message)
    );

    res.json({ message: 'If an account exists, a verification email has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox.',
        needsVerification: true,
      });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/forgot-password ────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return same message (prevent email enumeration)
    const message = 'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      return res.json({ message });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    sendPasswordResetEmail(email, resetToken).catch((err) =>
      console.error('Failed to send password reset email:', err.message)
    );

    res.json({ message });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/reset-password/:token ──────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    // Also verify email if not already
    user.isVerified = true;
    await user.save();

    const jwtToken = signToken(user._id);

    res.json({
      message: 'Password reset successfully!',
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/auth/profile ──────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, oldPassword, newPassword, preferences } = req.body;

    // Update name
    if (name) user.name = name;

    // Update password (requires old password)
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Old password is required to set a new password' });
      }
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
      user.password = newPassword;
    }

    // Update preferences
    if (preferences) {
      if (preferences.studyHoursPerDay !== undefined) {
        user.preferences.studyHoursPerDay = preferences.studyHoursPerDay;
      }
      if (preferences.subjects !== undefined) {
        user.preferences.subjects = preferences.subjects;
      }
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
