const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
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
router.post('/', validate(schemas.createExam), createExam);
router.put('/:id', validate(schemas.updateExam), updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
