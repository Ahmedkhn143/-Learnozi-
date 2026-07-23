import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FlashcardSet from '@/lib/models/FlashcardSet';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const sets = await FlashcardSet.find({ user: user._id }).sort({ updatedAt: -1 });

    const result = sets.map((s) => ({
      id: s._id,
      title: s.title,
      subject: s.subject,
      cards: s.cards,
      cardCount: s.cards.length,
      progress: s.progress,
      isAIGenerated: s.isAIGenerated,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ sets: result });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { title, subject, cards } = await req.json();

    if (!title || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: 'Title and cards array are required' }, { status: 400 });
    }

    const set = await FlashcardSet.create({
      user: user._id,
      title,
      subject: subject || 'General',
      cards,
      isAIGenerated: false,
    });

    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
