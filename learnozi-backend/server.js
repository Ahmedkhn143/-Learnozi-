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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

let server;
async function start() {
  try {
    await connectDB();
    server = app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down...`);
  if (server) { server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000); }
  else process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
start();
