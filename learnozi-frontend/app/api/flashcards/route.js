import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: sets, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = (sets || []).map((s) => ({
      id: s.id,
      title: s.title,
      subject: s.subject,
      cards: s.cards,
      cardCount: s.cards ? s.cards.length : 0,
      progress: s.progress,
      isAIGenerated: s.is_ai_generated,
      createdAt: s.created_at,
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

    const { title, subject, cards } = await req.json();

    if (!title || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: 'Title and cards array are required' }, { status: 400 });
    }

    const setId = crypto.randomUUID();

    const { data: set, error } = await supabase
      .from('flashcard_sets')
      .insert({
        id: setId,
        user_id: user.id,
        title,
        subject: subject || 'General',
        cards,
        progress: 0,
        is_ai_generated: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ set }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

