const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  createCourse,
  updateCourse,
  deleteCourse,
  getSyllabusBoards,
  getSyllabusTree,
  getSyllabusProgress,
  seedSyllabus
} = require('../controllers/academicController');

router.use(auth);

// Semesters
router.get('/', getSemesters);
router.post('/', validate(schemas.createSemester), createSemester);
router.put('/:id', validate(schemas.updateSemester), updateSemester);
router.delete('/:id', deleteSemester);

// Courses (nested under a semester)
router.post('/:semesterId/courses', validate(schemas.createCourse), createCourse);
router.put('/courses/:courseId', validate(schemas.updateCourse), updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Syllabus Tracker
router.get('/syllabus/boards', getSyllabusBoards);
router.post('/syllabus/seed', seedSyllabus);
router.get('/syllabus/:board/:subject', getSyllabusTree);
router.get('/syllabus/progress/:board/:subject', getSyllabusProgress);

module.exports = router;
