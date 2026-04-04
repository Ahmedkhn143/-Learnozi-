const Subject = require('../models/Subject');

// GET /api/subjects — list user's subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort('name');
    res.json({ count: subjects.length, subjects });
  } catch (err) {
    next(err);
  }
};

// GET /api/subjects/:id
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject });
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects — add a new subject
exports.createSubject = async (req, res, next) => {
  try {
    const { name, color, topics, notes } = req.body;
    const subject = await Subject.create({
      user: req.user._id,
      name,
      color,
      topics,
      notes,
    });
    res.status(201).json({ subject });
  } catch (err) {
    next(err);
  }
};

// PUT /api/subjects/:id — update subject
exports.updateSubject = async (req, res, next) => {
  try {
    const { name, color, topics, notes } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, color, topics, notes },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};
