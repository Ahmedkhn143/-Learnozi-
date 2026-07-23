import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, mode } = await req.json();
    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        explanation: `**${topic}** is an essential study concept. (Note: Set GEMINI_API_KEY in .env.local for full AI generation).`,
        example: `For example, understanding ${topic} helps solve core exam problems.`,
        summary: `${topic} is a core academic topic in your curriculum.`,
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are Learnozi AI tutor for Pakistani students.
Explain topic: "${topic.trim()}" in clear educational style.
Mode: ${mode || 'standard'}

Respond with ONLY valid JSON:
{
  "explanation": "Clear detailed explanation of the concept.",
  "example": "A concrete practical example.",
  "summary": "Key summary sentence for revision."
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { explanation: text, example: '', summary: '' };
    }

    return NextResponse.json({
      explanation: parsed.explanation || text,
      example: parsed.example || '',
      summary: parsed.summary || '',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'AI processing error' }, { status: 500 });
  }
}
