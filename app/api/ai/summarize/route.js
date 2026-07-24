import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, language } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        oneLineSummary: 'Note: Set GEMINI_API_KEY in .env.local for full AI summarization.',
        bullets: ['This is a mock summary key point 1.', 'This is a mock summary key point 2.'],
        keyTerms: [{ term: 'Demo', definition: 'A mock term definition.' }],
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Learnozi AI study assistant.
Summarize the following study material in ${language || 'english'} language.
Text: "${text}"

Respond with ONLY valid JSON:
{
  "oneLineSummary": "A concise one line summary of the text.",
  "bullets": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "keyTerms": [
    { "term": "Important word 1", "definition": "Brief definition of word 1" },
    { "term": "Important word 2", "definition": "Brief definition of word 2" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const resultText = result.response.text();

    const cleaned = resultText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        oneLineSummary: resultText,
        bullets: [resultText],
        keyTerms: [],
      };
    }

    return NextResponse.json({
      oneLineSummary: parsed.oneLineSummary || '',
      bullets: parsed.bullets || [],
      keyTerms: parsed.keyTerms || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'AI processing error' }, { status: 500 });
  }
}
