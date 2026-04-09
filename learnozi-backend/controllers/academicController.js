const Semester = require('../models/Semester');
const Course = require('../models/Course');

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
