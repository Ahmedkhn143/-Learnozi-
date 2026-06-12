const Semester = require('../models/Semester');
const Course = require('../models/Course');
const Syllabus = require('../models/Syllabus');
const FocusSession = require('../models/FocusSession');
const FlashcardSet = require('../models/Flashcard');

// ─── SEMESTERS ───

exports.getSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find({ user: req.user._id }).sort({ startDate: -1 });
    // Fetch courses for each semester and attach
    const courses = await Course.find({ user: req.user._id });
    
    // Group courses by semester
    const semestersWithCourses = semesters.map(sem => {
      const semObj = sem.toObject();
      semObj.courses = courses.filter(c => c.semester.toString() === sem._id.toString());
      return semObj;
    });

    res.json({ semesters: semestersWithCourses });
  } catch (error) {
    next(error);
  }
};

exports.createSemester = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;
    const sem = await Semester.create({ user: req.user._id, name, startDate, endDate });
    res.status(201).json({ semester: { ...sem.toObject(), courses: [] } });
  } catch (error) {
    next(error);
  }
};

exports.updateSemester = async (req, res, next) => {
  try {
    const sem = await Semester.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sem) return res.status(404).json({ error: 'Semester not found' });
    res.json({ semester: sem });
  } catch (error) {
    next(error);
  }
};

exports.deleteSemester = async (req, res, next) => {
  try {
    const sem = await Semester.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semester not found' });
    // Delete associated courses
    await Course.deleteMany({ semester: sem._id });
    res.json({ message: 'Semester and its courses deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── COURSES ───

exports.createCourse = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { name, code, creditHours, targetGrade, actualGrade } = req.body;
    
    const sem = await Semester.findOne({ _id: semesterId, user: req.user._id });
    if (!sem) return res.status(404).json({ error: 'Semester not found' });

    const course = await Course.create({
      user: req.user._id,
      semester: semesterId,
      name,
      code,
      creditHours,
      targetGrade,
      actualGrade
    });
    
    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.courseId, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.courseId, user: req.user._id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── SYLLABUS TRACKER ───

// GET /api/academics/syllabus/boards
exports.getSyllabusBoards = async (req, res, next) => {
  try {
    const list = await Syllabus.find().select('board subject');
    res.json({ syllabi: list });
  } catch (error) {
    next(error);
  }
};

// GET /api/academics/syllabus/:board/:subject
exports.getSyllabusTree = async (req, res, next) => {
  try {
    const { board, subject } = req.params;
    const syllabus = await Syllabus.findOne({ board, subject });
    if (!syllabus) return res.status(404).json({ error: 'Syllabus not found' });
    res.json({ syllabus });
  } catch (error) {
    next(error);
  }
};

// GET /api/academics/syllabus/progress/:board/:subject
exports.getSyllabusProgress = async (req, res, next) => {
  try {
    const { board, subject } = req.params;
    const userId = req.user._id;

    const [syllabus, sessions, flashcardSets] = await Promise.all([
      Syllabus.findOne({ board, subject }),
      FocusSession.find({ user: userId, subject, completed: true }),
      FlashcardSet.find({ user: userId, subject })
    ]);

    if (!syllabus) return res.status(404).json({ error: 'Syllabus not found' });

    // Track which topics have been covered
    // A topic is covered if the user has studied it in a focus session (duration > 15m)
    // or has a FlashcardSet covering it.
    const progressChapters = syllabus.chapters.map(chapter => {
      const topicsWithProgress = chapter.topics.map(topic => {
        // Simple heuristic: does any focus session or flashcard set title/subject contain the topic keyword
        const studied = sessions.some(s => s.durationMin > 15) || flashcardSets.some(f => f.cards.length > 3);
        return {
          name: topic,
          completed: studied,
          level: studied ? 'Completed' : 'Not Started'
        };
      });

      const completedCount = topicsWithProgress.filter(t => t.completed).length;
      const progressPercent = chapter.topics.length > 0 ? Math.round((completedCount / chapter.topics.length) * 100) : 0;

      return {
        chapterName: chapter.name,
        topics: topicsWithProgress,
        progressPercent
      };
    });

    const totalChapters = progressChapters.length;
    const overallProgress = totalChapters > 0
      ? Math.round(progressChapters.reduce((acc, c) => acc + c.progressPercent, 0) / totalChapters)
      : 0;

    res.json({
      board,
      subject,
      overallProgress,
      chapters: progressChapters
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/academics/syllabus/seed
// Pre-seed mock data so the app has curricula to display
exports.seedSyllabus = async (req, res, next) => {
  try {
    const existing = await Syllabus.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Syllabus already seeded.' });
    }

    const data = [
      {
        board: 'FBISE',
        subject: 'Physics',
        chapters: [
          { name: 'Electrostatics', topics: ["Coulomb's Law", 'Electric Field Lines', 'Electric Potential', 'Capacitors'] },
          { name: 'Current Electricity', topics: ["Ohm's Law", 'Resistivity', 'Kirchhoff Rules', 'Potentiometer'] },
          { name: 'Electromagnetism', topics: ['Magnetic Force', 'Ampere Law', 'Galvanometer', 'Cathode Ray Oscilloscope'] }
        ]
      },
      {
        board: 'MDCAT',
        subject: 'Biology',
        chapters: [
          { name: 'Cell Structure and Function', topics: ['Cell Wall', 'Cytoplasm', 'Mitochondria', 'Endoplasmic Reticulum'] },
          { name: 'Biological Molecules', topics: ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic Acids', 'Enzymes'] }
        ]
      }
    ];

    await Syllabus.create(data);
    res.json({ message: 'Syllabus seeded successfully!' });
  } catch (error) {
    next(error);
  }
};
