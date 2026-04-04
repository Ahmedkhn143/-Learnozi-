const Exam = require('../models/Exam');

// GET /api/exams — list user's exams (sorted by date, soonest first)
exports.getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ user: req.user._id })
      .populate('subject', 'name color')
      .sort('examDate');
    res.json({ count: exams.length, exams });
  } catch (err) {
    next(err);
  }
};

// GET /api/exams/:id
exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id })
      .populate('subject', 'name color');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ exam });
  } catch (err) {
    next(err);
  }
};

// POST /api/exams — save an exam date
exports.createExam = async (req, res, next) => {
  try {
    const { subject, title, examDate, priority, notes } = req.body;
    const exam = await Exam.create({
      user: req.user._id,
      subject,
      title,
      examDate,
      priority,
      notes,
    });
    await exam.populate('subject', 'name color');
    res.status(201).json({ exam });
  } catch (err) {
    next(err);
  }
};

// PUT /api/exams/:id — update exam
exports.updateExam = async (req, res, next) => {
  try {
    const { subject, title, examDate, priority, notes } = req.body;
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { subject, title, examDate, priority, notes },
      { new: true, runValidators: true }
    ).populate('subject', 'name color');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ exam });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/exams/:id
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    next(err);
  }
};
