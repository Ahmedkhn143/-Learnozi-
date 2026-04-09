const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
  completeOnboarding,
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', validate(schemas.register), register);

// POST /api/auth/login
router.post('/login', validate(schemas.login), login);

// GET  /api/auth/me  (protected)
router.get('/me', auth, getMe);

// Email verification
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', validate(schemas.resendVerification), resendVerification);

// Password reset
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', validate(schemas.resetPassword), resetPassword);

// Profile update (protected)
router.put('/profile', auth, validate(schemas.updateProfile), updateProfile);

// Onboarding (protected)
router.post('/onboarding', auth, validate(schemas.completeOnboarding), completeOnboarding);

module.exports = router;
