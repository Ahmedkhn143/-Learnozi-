const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

// All subject routes are protected
router.use(auth);

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', validate(schemas.createSubject), createSubject);
router.put('/:id', validate(schemas.updateSubject), updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
