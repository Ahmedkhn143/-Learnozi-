const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? 'MISSING_JWT_SECRET_SET_IN_VERCEL' : 'dev_only_secret');
if (!process.env.JWT_SECRET && nodeEnv === 'production') {
  console.error('WARNING: JWT_SECRET is not set! Auth will be broken. Set it in Vercel Environment Variables.');
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/learnozi',
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || '"Learnozi" <noreply@learnozi.com>',
  },
};
