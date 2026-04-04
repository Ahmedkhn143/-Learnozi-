const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');

// All exam routes are protected
router.use(auth);

router.get('/', getExams);
router.get('/:id', getExam);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
