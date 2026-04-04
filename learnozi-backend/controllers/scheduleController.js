const Schedule = require('../models/Schedule');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// ─── Helper: generate study sessions ─────────────────────
// Distributes topics across available days, weighting by
// exam proximity and topic difficulty.
function buildSessions(subjects, exams, startDate, endDate, hoursPerDay) {
  const MAX_DAYS = 365;
  const MAX_SESSIONS = 2000;
  const sessions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.min(MAX_DAYS, Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))));
  const minutesPerDay = hoursPerDay * 60;

  // Build a flat list of study items from subjects + their topics
  const studyItems = [];
  for (const subj of subjects) {
    const exam = exams.find((e) => String(e.subject._id || e.subject) === String(subj._id));
    const urgency = exam ? Math.max(1, 10 - Math.ceil((exam.examDate - start) / (1000 * 60 * 60 * 24 * 7))) : 3;

    const topics = subj.topics.length ? subj.topics : [{ title: subj.name, difficulty: 'medium' }];
    for (const topic of topics) {
      const diffWeight = topic.difficulty === 'hard' ? 1.5 : topic.difficulty === 'easy' ? 0.7 : 1;
      studyItems.push({
        subjectId: subj._id,
        subjectName: subj.name,
        topic: topic.title,
        weight: diffWeight * urgency,
      });
    }
  }

  if (!studyItems.length) return sessions;

  // Normalise weights to get per-item share of total time
  const totalWeight = studyItems.reduce((sum, item) => sum + item.weight, 0);

  // Distribute across days using round-robin weighted allocation
  let dayIndex = 0;
  for (const item of studyItems) {
    const totalMinutes = Math.round((item.weight / totalWeight) * totalDays * minutesPerDay);
    const sessionCount = Math.max(1, Math.round(totalMinutes / 45)); // ~45 min sessions
    const perSession = Math.round(totalMinutes / sessionCount);

    for (let i = 0; i < sessionCount && sessions.length < MAX_SESSIONS; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + (dayIndex % totalDays));
      dayIndex++;

      sessions.push({
        date,
        subject: item.subjectId,
        topic: item.topic,
        durationMinutes: Math.min(Math.max(perSession, 15), 120),
        completed: false,
      });
    }
  }

  // Sort sessions chronologically
  sessions.sort((a, b) => a.date - b.date);
  return sessions;
}

// ─── Controllers ─────────────────────────────────────────

// POST /api/schedules/generate — create a study schedule from subjects & exams
exports.generate = async (req, res, next) => {
  try {
    const { title, startDate, endDate, hoursPerDay, subjectIds } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Fetch user's subjects (optionally filtered)
    const filter = { user: req.user._id };
    if (subjectIds && subjectIds.length) filter._id = { $in: subjectIds };
    const subjects = await Subject.find(filter);

    if (!subjects.length) {
      return res.status(400).json({ error: 'No subjects found. Add subjects first.' });
    }

    // Fetch upcoming exams for those subjects
    const exams = await Exam.find({
      user: req.user._id,
      subject: { $in: subjects.map((s) => s._id) },
      examDate: { $gte: new Date() },
    }).populate('subject', 'name');

    const sessions = buildSessions(
      subjects,
      exams,
      startDate,
      endDate,
      hoursPerDay || 4
    );

    const schedule = await Schedule.create({
      user: req.user._id,
      title: title || `Study Schedule — ${new Date(startDate).toLocaleDateString()}`,
      startDate,
      endDate,
      hoursPerDay: hoursPerDay || 4,
      sessions,
    });

    await schedule.populate('sessions.subject', 'name color');
    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
};

// GET /api/schedules — list schedules (paginated)
exports.getSchedules = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [schedules, total] = await Promise.all([
      Schedule.find({ user: req.user._id })
        .populate('sessions.subject', 'name color')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Schedule.countDocuments({ user: req.user._id }),
    ]);

    res.json({ page, limit, total, count: schedules.length, schedules });
  } catch (err) {
    next(err);
  }
};

// GET /api/schedules/:id
exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id })
      .populate('sessions.subject', 'name color');
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ schedule });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/schedules/:id/sessions/:sessionId — toggle session completed
exports.toggleSession = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    const session = schedule.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.completed = req.body.completed !== undefined ? req.body.completed : !session.completed;
    await schedule.save();

    res.json({ session, progress: schedule.progress });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
};
