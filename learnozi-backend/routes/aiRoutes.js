const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators');
const {
  explain,
  chat,
  summarize,
  getConversations,
  getConversation,
  deleteConversation,
  socraticChat,
} = require('../controllers/aiController');
const { generateMindMap } = require('../controllers/mindmapController');

// All AI routes are protected
router.use(auth);

// Explain a concept (new conversation)
router.post('/explain', validate(schemas.explain), explain);

// Continue chatting
router.post('/chat', validate(schemas.chat), chat);

// Summarize notes
router.post('/summarize', validate(schemas.summarize), summarize);

// Conversation history
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

// Advanced features
router.post('/mindmap', generateMindMap);
router.post('/socratic-chat', socraticChat);

module.exports = router;
