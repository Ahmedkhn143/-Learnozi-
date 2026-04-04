const StudyPlan = require('../models/StudyPlan');
const axios = require('axios');
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

// POST /api/plans/generate — AI-generated plan
exports.generateWithAI = async (req, res, next) => {
  try {
    const { title, subjects, examDate, preferences } = req.body;

    if (!config.openai.apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a study planning assistant. Generate a detailed study plan as a JSON array of tasks. Each task: { "title": string, "subject": string, "priority": "low"|"medium"|"high"|"urgent", "estimatedMinutes": number, "scheduledDate": "YYYY-MM-DD" }. Respond ONLY with the JSON array.',
          },
          {
            role: 'user',
            content: `Create a study plan:\n- Subjects: ${JSON.stringify(subjects)}\n- Exam date: ${examDate}\n- Study hours per day: ${req.user.preferences?.studyHoursPerDay || 4}\n- Preferences: ${preferences || 'None'}\n- Start from tomorrow`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    let aiTasks = [];
    try {
      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      aiTasks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error('Failed to parse AI response');
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
