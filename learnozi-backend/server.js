require('./utils/mongooseMock');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const authRoutes      = require('./routes/authRoutes');
const subjectRoutes   = require('./routes/subjectRoutes');
const examRoutes      = require('./routes/examRoutes');
const scheduleRoutes  = require('./routes/scheduleRoutes');
const planRoutes      = require('./routes/planRoutes');
const aiRoutes        = require('./routes/aiRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const focusRoutes     = require('./routes/focusRoutes');
const documentRoutes  = require('./routes/documentRoutes');
const academicRoutes  = require('./routes/academicRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many auth attempts.' } }));

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — no DB needed (always works)
app.get('/api/health', (_req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
  mockDb: process.env.MOCK_DB,
  mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@') : 'NOT SET',
}));

// DB connection middleware — connects lazily on first request (serverless-safe)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ error: 'Database unavailable', detail: err.message });
  }
});

app.use('/api/auth',       authRoutes);
app.use('/api/subjects',   subjectRoutes);
app.use('/api/exams',      examRoutes);
app.use('/api/schedules',  scheduleRoutes);
app.use('/api/plans',      planRoutes);
app.use('/api/ai',         aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/focus',      focusRoutes);
app.use('/api/documents',  documentRoutes);
app.use('/api/academics',  academicRoutes);
app.use('/api/analytics',  analyticsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

// Local development — start server normally
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const port = config.port;
  connectDB()
    .then(() => {
      app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    })
    .catch((err) => {
      console.error('Failed to connect DB, starting server anyway:', err.message);
      app.listen(port, () => console.log(`Server running on http://localhost:${port} (no DB)`));
    });

  process.on('SIGINT', () => { console.log('\nSIGINT — shutting down...'); process.exit(0); });
  process.on('SIGTERM', () => { console.log('\nSIGTERM — shutting down...'); process.exit(0); });
}

// Vercel needs synchronous module.exports
module.exports = app;
