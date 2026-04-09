const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  generate,
  getSchedules,
  getSchedule,
  toggleSession,
  deleteSchedule,
} = require('../controllers/scheduleController');

// All schedule routes are protected
router.use(auth);

// Generate a new study schedule from subjects + exams
router.post('/generate', validate(schemas.generateSchedule), generate);

router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.delete('/:id', deleteSchedule);

// Toggle a study session as completed
router.patch('/:id/sessions/:sessionId', validate(schemas.toggleSession), toggleSession);

module.exports = router;
