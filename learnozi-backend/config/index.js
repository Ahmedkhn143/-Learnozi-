require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? undefined : 'dev_only_secret');
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production');
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
};
