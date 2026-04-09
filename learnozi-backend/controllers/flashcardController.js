const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlashcardSet = require('../models/Flashcard');
const config = require('../config');

// Gemini helper
function getModel() {
  if (!config.gemini.apiKey) {
    throw Object.assign(new Error('Gemini API key not configured'), { statusCode: 503 });
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// ── POST /api/flashcards/generate ────────────────────────
// AI se flashcards generate karo
exports.generate = async (req, res, next) => {
  try {
    const { topic, subject, count = 10, language = 'english' } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const cardCount = Math.min(20, Math.max(5, parseInt(count)));
    const model = getModel();

    const langInstruction = language === 'urdu'
      ? 'Write both questions and answers in Urdu (you can use Roman Urdu).'
      : 'Write in clear English.';

    const prompt = `You are a study assistant for Pakistani students.
Create exactly ${cardCount} flashcards for the topic: "${topic.trim()}"
${langInstruction}

Respond with ONLY valid JSON — no markdown, no code fences.
Use this exact schema:
{
  "title": "Short descriptive title for this flashcard set",
  "cards": [
    { "question": "Question here?", "answer": "Clear concise answer here." }
  ]
}

Rules:
- Questions should test understanding, not just memorization
- Answers should be concise (1-3 sentences max)
- Cover different aspects of the topic
- Make it useful for exam preparation`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Parse JSON
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      return res.status(500).json({ error: 'AI did not return valid flashcards. Please try again.' });
    }

    // Save to DB
    const set = await FlashcardSet.create({
      user: req.user._id,
      title: parsed.title || topic.trim(),
      subject: subject || 'General',
      cards: parsed.cards.map((c) => ({
        question: c.question?.trim() || '',
        answer: c.answer?.trim() || '',
        status: 'new',
      })).filter((c) => c.question && c.answer),
      isAIGenerated: true,
    });

    res.status(201).json({ set });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/flashcards ───────────────────────────────────
// User ke saare sets
exports.getSets = async (req, res, next) => {
  try {
    const sets = await FlashcardSet.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title subject cards isAIGenerated createdAt updatedAt');

    const result = sets.map((s) => ({
      id: s._id,
      title: s.title,
      subject: s.subject,
      cardCount: s.cards.length,
      progress: s.progress,
      isAIGenerated: s.isAIGenerated,
      isPublic: s.isPublic,
      university: s.university,
      createdAt: s.createdAt,
    }));

    res.json({ sets: result });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/flashcards/:id ───────────────────────────────
// Ek set ke saare cards
exports.getSet = async (req, res, next) => {
  try {
    const set = await FlashcardSet.findOne({ _id: req.params.id, user: req.user._id });
    if (!set) return res.status(404).json({ error: 'Flashcard set not found' });
    res.json({ set });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/flashcards/:id/cards/:cardId ───────────────
// Card ka status update karo (new / learning / known)
exports.updateCard = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'learning', 'known'].includes(status)) {
      return res.status(400).json({ error: 'status must be new, learning, or known' });
    }

    const set = await FlashcardSet.findOne({ _id: req.params.id, user: req.user._id });
    if (!set) return res.status(404).json({ error: 'Flashcard set not found' });

    const card = set.cards.id(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    card.status = status;
    card.reviewedAt = new Date();
    await set.save();

    res.json({ card, progress: set.progress });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/flashcards/:id ────────────────────────────
exports.deleteSet = async (req, res, next) => {
  try {
    await FlashcardSet.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Flashcard set deleted' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/flashcards ──────────────────────────────────
// Manual flashcard set banana
exports.createSet = async (req, res, next) => {
  try {
    const { title, subject, cards } = req.body;
    if (!title || !cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'title and cards are required' });
    }

    const set = await FlashcardSet.create({
      user: req.user._id,
      title: title.trim(),
      subject: subject || 'General',
      cards: cards.map((c) => ({
        question: c.question?.trim(),
        answer: c.answer?.trim(),
        status: 'new',
      })).filter((c) => c.question && c.answer),
      isAIGenerated: false,
    });

    res.status(201).json({ set });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/public/flashcards ───────────────────────────────
// Get all public sets globally
exports.getPublicSets = async (req, res, next) => {
  try {
    const { search, university } = req.query;
    const query = { isPublic: true };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (university) query.university = { $regex: university, $options: 'i' };

    const sets = await FlashcardSet.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50); // Pagination in future
    
    res.json({ sets });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/flashcards/:id/clone ───────────────────────────
// Clone a public set to own account
exports.cloneSet = async (req, res, next) => {
  try {
    const original = await FlashcardSet.findOne({ _id: req.params.id, isPublic: true });
    if (!original) return res.status(404).json({ error: 'Public set not found' });

    // Ensure users don't clone their own set
    if (original.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot clone your own set' });
    }

    const cloned = await FlashcardSet.create({
      user: req.user._id,
      title: `${original.title} (Clone)`,
      subject: original.subject,
      cards: original.cards.map(c => ({ question: c.question, answer: c.answer, status: 'new' })),
      isAIGenerated: original.isAIGenerated,
      isPublic: false, // private by default
      university: original.university,
    });

    res.status(201).json({ set: cloned });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/flashcards/:id/public ─────────────────────────────
// Toggle public status and set university
exports.togglePublic = async (req, res, next) => {
  try {
    const { isPublic, university } = req.body;
    const set = await FlashcardSet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPublic, university: university || '' },
      { new: true }
    );
    if (!set) return res.status(404).json({ error: 'Set not found' });
    res.json({ set });
  } catch (error) {
    next(error);
  }
};
