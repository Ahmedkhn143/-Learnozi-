const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const config = require('../config');

// Gemini client helper
function getModel() {
  if (!config.gemini.apiKey) {
    throw Object.assign(new Error('Gemini API key not configured'), { statusCode: 503 });
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// Structured JSON system prompt
const STRUCTURED_SYSTEM_PROMPT = `You are Learnozi AI, a friendly expert tutor for Pakistani students.
You can explain in both English and Urdu depending on what the student writes.
If the student writes in Urdu or asks for Urdu, respond in Urdu (Roman Urdu or script).
If the student writes in English, respond in English.

When given a topic, respond with ONLY valid JSON — no markdown, no code fences.
Use this exact schema:
{
  "explanation": "A clear, detailed explanation of the topic (2-4 paragraphs).",
  "example": "A concrete, practical example that illustrates the concept.",
  "summary": "A one-sentence summary a student can use for quick revision."
}`;

const EXAM_STYLE_INSTRUCTION = `VERY IMPORTANT: This student wants to see exactly how to write this answer to get FULL MARKS in a Pakistani Board Exam (Matric/Intermediate).
Structure the "explanation" section with these exact sub-headings (translated if in Urdu):
1. **Main Heading** (Capitalized/Centralized style)
2. **Statement / Introduction**
3. **Key Characteristics / Bullet Points**
4. **Conclusion / Key Takeaway**

Also, if applicable, insert a "Diagram Suggestion" note like: [DIAGRAM: Draw a neat labelled diagram of X here].
Bold and highlight all important keywords and terminologies. Use clear headers for each section.`;

function parseStructuredResponse(raw) {
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
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
    return { explanation: raw.trim(), example: '', summary: '' };
  }
}

// POST /api/ai/explain
exports.explain = async (req, res, next) => {
  try {
    const { topic, level, language, mode } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'topic is required' });
    }

    // Personalize prompt based on academic profile
    const profile = req.user.academicProfile || {};
    const profileInfo = req.user.isOnboarded 
      ? `This student is at the "${profile.educationLevel}" level, studying "${profile.fieldOfStudy}" (${profile.currentYear}).`
      : `This student is at a "${level || 'intermediate'}" level.`;

    const systemInstruction = `
${STRUCTURED_SYSTEM_PROMPT}

${profileInfo} Tailor your tone, complexity, and examples exactly for this grade level.

${mode === 'exam' ? EXAM_STYLE_INSTRUCTION : ''}

${language === 'urdu' ? 'Respond in Urdu language.' : ''}`;

    const result = await generateWithFailover({
      prompt: topic.trim(),
      systemInstruction,
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 }
    });

    const raw = result.response.text();
    const parsed = parseStructuredResponse(raw);

    const conversation = await Conversation.create({
      user: req.user._id,
      topic: topic.trim().substring(0, 120),
      subject: 'General',
      messages: [
        { role: 'user', content: topic.trim() },
        { role: 'assistant', content: JSON.stringify(parsed) },
      ],
    });

    res.json({ ...parsed, conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId, subject } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
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

    const model = getModel();

    // Build Gemini history — 'assistant' becomes 'model' in Gemini
    const history = conversation.messages
      .slice(-10, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Personalize based on profile
    const profile = req.user.academicProfile || {};
    const profileInfo = req.user.isOnboarded 
      ? `This student is at the "${profile.educationLevel}" level, studying "${profile.fieldOfStudy}" (${profile.currentYear}).`
      : "";

    const chat = model.startChat({
      systemInstruction: `You are Learnozi AI, a friendly expert tutor for Pakistani students specializing in ${conversation.subject || 'general studies'}.
${profileInfo} Help students understand concepts clearly by tailoring complexity to their grade level.
If the student writes in Urdu, reply in Urdu. If in English, reply in English.
Be encouraging, accurate, and concise.`,
      history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    res.json({ reply, conversationId: conversation._id });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/conversations
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
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
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

// POST /api/ai/summarize — Notes Summarizer
exports.summarize = async (req, res, next) => {
  try {
    const { text, language = 'english' } = req.body;

    const model = getModel();

    const langInstruction = language === 'urdu'
      ? 'Respond in Urdu (Roman Urdu is fine).'
      : 'Respond in clear English.';

    const prompt = `You are a study assistant for Pakistani students.
Summarize the following text into 5-7 concise bullet points and extract key terms.
${langInstruction}

Respond with ONLY valid JSON — no markdown, no code fences.
Use this exact schema:
{
  "bullets": ["bullet point 1", "bullet point 2", ...],
  "keyTerms": [
    { "term": "Term Name", "definition": "Brief definition" }
  ],
  "oneLineSummary": "A single-sentence summary of the entire text."
}

Text to summarize:
"""
${text.substring(0, 12000)}
"""`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
    });

    const raw = result.response.text();
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    if (!parsed.bullets || !Array.isArray(parsed.bullets)) {
      return res.status(500).json({ error: 'AI did not return valid summary. Please try again.' });
    }

    res.json({
      bullets: parsed.bullets,
      keyTerms: parsed.keyTerms || [],
      oneLineSummary: parsed.oneLineSummary || '',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/socratic-chat
exports.socraticChat = async (req, res, next) => {
  try {
    const { message, conversationId, topic, subject } = req.body;

    if (!message && !topic) {
      return res.status(400).json({ error: 'message or topic is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    } else {
      conversation = await Conversation.create({
        user: req.user._id,
        topic: topic || message.substring(0, 100),
        subject: subject || 'General',
        messages: [],
      });
    }

    if (message) {
      conversation.messages.push({ role: 'user', content: message });
    }

    const profile = req.user.academicProfile || {};
    const profileInfo = req.user.isOnboarded 
      ? `The student is in "${profile.educationLevel}" level, studying "${profile.fieldOfStudy}" (${profile.currentYear}).`
      : "";

    const systemPrompt = `You are a strict but encouraging Socratic tutor. 
Your goal is to help the student learn the subject "${conversation.subject}" by asking probing questions rather than giving direct answers.
${profileInfo}

Rules:
1. NEVER give direct answers or explanations, even if the student asks for them directly.
2. Ask only ONE question at a time.
3. Guide the student step-by-step to arrive at the answer on their own.
4. If they give an incorrect answer, ask a clarifying question to show them the flaw in their reasoning.
5. If they are correct, validate it enthusiastically and ask the next logical question to deepen understanding.
6. Speak in the language they use (English or Roman Urdu).`;

    const history = conversation.messages
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const promptMessage = message || `Start our Socratic study session on the topic: ${topic}`;

    const { generateWithFailover } = require('../utils/gemini');
    const result = await generateWithFailover({
      prompt: promptMessage,
      systemInstruction: systemPrompt,
      history: history.length > 1 ? history.slice(0, -1) : undefined,
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 }
    });

    const reply = result.response.text();

    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    res.json({ reply, conversationId: conversation._id });
  } catch (error) {
    console.error('Socratic Chat Error:', error.message);
    next(error);
  }
};

