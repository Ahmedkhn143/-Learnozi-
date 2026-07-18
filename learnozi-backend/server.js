// ─── Diagnostic: catch any top-level require crash ────────────────────────────
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (e) {
    console.error(`[STARTUP CRASH] Failed to require "${modulePath}": ${e.message}`);
    throw e; // re-throw so Vercel logs show it
  }
}

safeRequire('./utils/mongooseMock');
const express     = safeRequire('express');
const cors        = safeRequire('cors');
const helmet      = safeRequire('helmet');
const rateLimit   = safeRequire('express-rate-limit');
const connectDB   = safeRequire('./config/db');
const config      = safeRequire('./config');
const errorHandler = safeRequire('./middleware/errorHandler');

const authRoutes      = safeRequire('./routes/authRoutes');
const subjectRoutes   = safeRequire('./routes/subjectRoutes');
const examRoutes      = safeRequire('./routes/examRoutes');
const scheduleRoutes  = safeRequire('./routes/scheduleRoutes');
const planRoutes      = safeRequire('./routes/planRoutes');
const aiRoutes        = safeRequire('./routes/aiRoutes');
const flashcardRoutes = safeRequire('./routes/flashcardRoutes');
const focusRoutes     = safeRequire('./routes/focusRoutes');
const documentRoutes  = safeRequire('./routes/documentRoutes');
const academicRoutes  = safeRequire('./routes/academicRoutes');
const analyticsRoutes = safeRequire('./routes/analyticsRoutes');

// ─────────────────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many auth attempts.' },
}));

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check — no DB needed (always responds) ────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
  mongoUri: process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')
    : 'NOT SET',
  jwtSet: !!process.env.JWT_SECRET,
  supabaseSet: !!process.env.SUPABASE_URL,
}));

// ── DB middleware — lazy connection (serverless-safe) ─────────────────────────
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

// ── Local dev only ────────────────────────────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const port = config.port;
  connectDB()
    .then(() => app.listen(port, () => console.log(`Server running on http://localhost:${port}`)))
    .catch((err) => {
      console.error('DB connect failed, starting anyway:', err.message);
      app.listen(port, () => console.log(`Server running on http://localhost:${port} (no DB)`));
    });

  process.on('SIGINT',  () => { console.log('\nShutting down...'); process.exit(0); });
  process.on('SIGTERM', () => { console.log('\nShutting down...'); process.exit(0); });
}

module.exports = app;
