const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  explain,
  chat,
  getConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/aiController');

// All AI routes are protected
router.use(auth);

// Explain a concept (new conversation)
router.post('/explain', explain);

// Continue chatting
router.post('/chat', chat);

// Conversation history
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

module.exports = router;
