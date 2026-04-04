const axios = require('axios');
const Conversation = require('../models/Conversation');
const config = require('../config');

// ─── OpenAI client helper ────────────────────────────────

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages, { maxTokens = 1024, temperature = 0.7 } = {}) {
  if (!config.openai.apiKey) {
    throw Object.assign(new Error('OpenAI API key not configured'), { statusCode: 503 });
  }

  const { data } = await axios.post(
    OPENAI_URL,
    {
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return data.choices[0].message.content;
}

// ─── Structured JSON helpers ─────────────────────────────

const STRUCTURED_SYSTEM_PROMPT = `You are Learnozi AI, a friendly expert tutor.
When given a topic, respond with ONLY valid JSON — no markdown, no code fences.
Use this exact schema:
{
  "explanation": "A clear, detailed explanation of the topic (2-4 paragraphs).",
  "example": "A concrete, practical example that illustrates the concept.",
  "summary": "A one-sentence summary a student can use for quick revision."
}`;

function parseStructuredResponse(raw) {
  // Strip markdown code fences if the model wraps its answer
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required keys exist and are strings
    const keys = ['explanation', 'example', 'summary'];
    for (const key of keys) {
      if (typeof parsed[key] !== 'string' || !parsed[key].trim()) {
        throw new Error(`Missing or empty field: ${key}`);
      }
    }

    return {
      explanation: parsed.explanation.trim(),
      example: parsed.example.trim(),
      summary: parsed.summary.trim(),
    };
  } catch {
    // Graceful fallback — return the raw text as the explanation
    return {
      explanation: raw.trim(),
      example: '',
      summary: '',
    };
  }
}

// ─── POST /api/ai/explain ────────────────────────────────
// Input body:  { topic: string, level?: string }
// Output JSON: { explanation, example, summary, conversationId }

exports.explain = async (req, res, next) => {
  try {
    const { topic, level } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const raw = await callOpenAI(
      [
        {
          role: 'system',
          content: `${STRUCTURED_SYSTEM_PROMPT}\nAdjust complexity for a ${level || 'intermediate'}-level student.`,
        },
        { role: 'user', content: topic.trim() },
      ],
      { maxTokens: 1024, temperature: 0.6 }
    );

    const result = parseStructuredResponse(raw);

    // Persist as conversation for history
    const conversation = await Conversation.create({
      user: req.user._id,
      topic: topic.trim().substring(0, 120),
      subject: 'General',
      messages: [
        { role: 'user', content: topic.trim() },
        { role: 'assistant', content: JSON.stringify(result) },
      ],
    });

    res.json({ ...result, conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/chat — continue a conversation
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId, subject } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    } else {
      conversation = await Conversation.create({
        user: req.user._id,
        topic: message.substring(0, 100),
        subject: subject || 'General',
        messages: [],
      });
    }

    conversation.messages.push({ role: 'user', content: message });

    // Build context for OpenAI (system + last 10 messages)
    const aiMessages = [
      {
        role: 'system',
        content: `You are Learnozi AI, a friendly expert tutor specializing in ${conversation.subject}. Help students understand concepts clearly. Be encouraging but accurate.`,
      },
      ...conversation.messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const reply = await callOpenAI(aiMessages);

    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    res.json({ reply, conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/conversations — list user's conversations (paginated)
exports.getConversations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .select('topic subject updatedAt messages')
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ user: req.user._id }),
    ]);

    const list = conversations.map((c) => ({
      id: c._id,
      topic: c.topic,
      subject: c.subject,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content?.substring(0, 100),
    }));

    res.json({ page, limit, total, conversations: list });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/conversations/:id
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/ai/conversations/:id
exports.deleteConversation = async (req, res, next) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
};
