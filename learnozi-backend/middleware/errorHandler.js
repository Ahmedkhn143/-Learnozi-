const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }

  // Support both err.statusCode and err.status
  const statusCode = err.statusCode || err.status || 500;

  // In production, never leak internal error messages for 500s
  const message =
    statusCode === 500 && config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
