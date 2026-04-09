const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  getAll,
  getById,
  create,
  update,
  remove,
  generateWithAI,
  updateTask,
} = require('../controllers/planController');

// All plan routes are protected
router.use(auth);

// POST /api/plans/generate  — AI-generated plan (before /:id)
router.post('/generate', validate(schemas.generatePlan), generateWithAI);

// CRUD
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validate(schemas.createPlan), create);
router.put('/:id', validate(schemas.updatePlan), update);
router.delete('/:id', remove);

// Task toggle
router.patch('/:id/tasks/:taskId', validate(schemas.updateTask), updateTask);

module.exports = router;
