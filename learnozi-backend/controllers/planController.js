const StudyPlan = require('../models/StudyPlan');
const config = require('../config');

// GET /api/plans — list all user's plans (paginated)
exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      StudyPlan.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .select('-tasks')
        .skip(skip)
        .limit(limit),
      StudyPlan.countDocuments({ user: req.user._id }),
    ]);

    res.json({ page, limit, total, plans });
  } catch (error) {
    next(error);
  }
};

// GET /api/plans/:id — single plan with tasks
exports.getById = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

// POST /api/plans — create manual plan
exports.create = async (req, res, next) => {
  try {
    const { title, examDate, subjects, tasks } = req.body;
    const plan = await StudyPlan.create({
      user: req.user._id,
      title,
      examDate,
      subjects,
      tasks: tasks || [],
    });
    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
};

// POST /api/plans/generate — AI-generated plan (via Gemini)
exports.generateWithAI = async (req, res, next) => {
  try {
    const { title, subjects, examDate, preferences } = req.body;

    const prompt = `You are a study planning assistant for Pakistani students.
Generate a detailed study plan as a JSON array of tasks.

Each task should follow this schema:
{ "title": string, "subject": string, "priority": "low"|"medium"|"high"|"urgent", "estimatedMinutes": number, "scheduledDate": "YYYY-MM-DD" }

Respond with ONLY the JSON array — no markdown, no code fences.

Details:
- Subjects: ${JSON.stringify(subjects)}
- Exam date: ${examDate}
- Study hours per day: ${req.user.preferences?.studyHoursPerDay || 4}
- Preferences: ${preferences || 'None'}
- Start from tomorrow`;

    const result = await generateWithFailover({
      prompt,
      generationConfig: { temperature: 0.5, maxOutputTokens: 2000 }
    });

    const raw = result.response.text();

    let aiTasks = [];
    try {
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      aiTasks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error('Failed to parse AI response for study plan');
    }

    const plan = await StudyPlan.create({
      user: req.user._id,
      title: title || `AI Study Plan — ${new Date().toLocaleDateString()}`,
      examDate,
      subjects,
      tasks: aiTasks,
      isAIGenerated: true,
    });

    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/plans/:id — update plan metadata
exports.update = async (req, res, next) => {
  try {
    const allowed = ['title', 'examDate', 'subjects', 'status'];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/plans/:id/tasks/:taskId — update a task by subdocument ID
exports.updateTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;
    const plan = await StudyPlan.findOne({ _id: id, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const task = plan.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { status, actualMinutes, priority } = req.body;
    if (status) task.status = status;
    if (actualMinutes !== undefined) task.actualMinutes = actualMinutes;
    if (priority) task.priority = priority;
    if (status === 'completed') task.completedAt = new Date();

    await plan.save();
    res.json({ plan });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/plans/:id
exports.remove = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};
