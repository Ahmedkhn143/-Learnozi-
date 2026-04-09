const Document = require('../models/Document');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Reusable function to get Gemini model
const getModel = () => {
  if (!config.gemini?.apiKey) {
    throw new Error('Gemini API key is missing');
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// POST /api/documents/upload
// Note: Middleware handles multer memory storage
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    // Extract text from buffer
    let data;
    try {
      data = await pdf(req.file.buffer);
    } catch (err) {
      return res.status(400).json({ error: 'Failed to read PDF. It might be corrupted or image-based.' });
    }

    const text = data.text.trim();
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Could not extract enough text from the PDF. Is it just images?' });
    }

    // Determine a title (fallback to original filename)
    let title = req.body.title;
    if (!title) {
      title = req.file.originalname.replace('.pdf', '');
    }

    // Save to DB (We discard the raw buffer to save DB space/Server storage)
    const doc = await Document.create({
      user: req.user._id,
      title,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      extractedText: text,
      characterCount: text.length,
    });

    res.status(201).json({
      message: 'PDF analyzed and saved successfully!',
      document: doc, // toJSON will omit the massive extractedText
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (error) {
    next(error);
  }
};

// GET /api/documents/:id
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    // We can explicitly send the extractedText here if the frontend needs it, but mostly we just need metadata
    res.json({ document: doc });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/documents/:id/chat
exports.chatDocument = async (req, res, next) => {
  try {
    const { question, history = [] } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const model = getModel();

    // RAG Strategy: Inject the extracted text as the primary brain for the AI
    // Personalize based on profile
    const profile = req.user.academicProfile || {};
    const profileInfo = req.user.isOnboarded 
      ? `This student is at the "${profile.educationLevel}" level, studying "${profile.fieldOfStudy}" (${profile.currentYear}).`
      : "";

    const systemPrompt = `You are a helpful study assistant for Pakistani students.
Your ONLY source of knowledge for this conversation is the document text provided below.
${profileInfo} Tailor your explanations to be perfectly understandable for this student's grade level.
If the student asks a question that is NOT covered in the document text, politely reply: 
"Main is sawal ka jawab is document ke mutabiq nahi de sakta kyunki ye information is PDF mein maujood nahi hai."
Do NOT invent answers or use outside knowledge. 
Keep answers concise, clear, and academic. You may respond in the language the student uses (English or Roman Urdu).

--- DOCUMENT TEXT START ---
${doc.extractedText}
--- DOCUMENT TEXT END ---`;

    // Map history to Gemini format (user vs model)
    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will strictly use only the provided document text.' }] },
        ...formattedHistory
      ],
      generationConfig: { temperature: 0.2 }, // Low temp to prevent hallucination
    });

    const result = await chat.sendMessage(question);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    console.error('Document Chat Error:', error.message);
    next(error);
  }
};
