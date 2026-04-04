const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
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
router.post('/generate', generateWithAI);

// CRUD
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Task toggle
router.patch('/:id/tasks/:taskId', updateTask);

module.exports = router;
