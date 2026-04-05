const FocusSession = require('../models/FocusSession');

// POST /api/focus — session save karo
exports.saveSession = async (req, res, next) => {
  try {
    const { subject, durationMin, completed } = req.body;
    if (!durationMin || durationMin < 1) {
      return res.status(400).json({ error: 'durationMin is required' });
    }
    const session = await FocusSession.create({
      user: req.user._id,
      subject: subject || 'General',
      durationMin,
      completed: completed !== false,
    });
    res.status(201).json({ session });
  } catch (error) { next(error); }
};

// GET /api/focus/stats — dashboard ke liye stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Last 7 days
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [weekSessions, todaySessions, totalSessions] = await Promise.all([
      FocusSession.find({ user: userId, completedAt: { $gte: weekAgo }, completed: true }),
      FocusSession.find({ user: userId, completedAt: { $gte: todayStart }, completed: true }),
      FocusSession.countDocuments({ user: userId, completed: true }),
    ]);

    const weekMinutes  = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMin, 0);

    // Streak — consecutive days with at least 1 session
    const allSessions = await FocusSession.find({ user: userId, completed: true })
      .sort({ completedAt: -1 }).select('completedAt');

    let streak = 0;
    const daySet = new Set(allSessions.map((s) => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));

    const checkDay = new Date(now);
    while (true) {
      const key = `${checkDay.getFullYear()}-${checkDay.getMonth()}-${checkDay.getDate()}`;
      if (!daySet.has(key)) break;
      streak++;
      checkDay.setDate(checkDay.getDate() - 1);
    }

    res.json({
      todayMinutes,
      weekMinutes,
      totalSessions,
      streak,
      weekSessions: weekSessions.length,
    });
  } catch (error) { next(error); }
};

// GET /api/focus/history — recent sessions
exports.getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const sessions = await FocusSession.find({ user: req.user._id, completed: true })
      .sort({ completedAt: -1 }).limit(limit);
    res.json({ sessions });
  } catch (error) { next(error); }
};
