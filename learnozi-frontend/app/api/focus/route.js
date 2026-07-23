import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const now = new Date();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const { data: weekSessions, error: weekErr } = await supabase
      .from('focus_sessions')
      .select('duration_min')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', weekAgo.toISOString());

    if (weekErr) throw weekErr;

    const { data: todaySessions, error: todayErr } = await supabase
      .from('focus_sessions')
      .select('duration_min')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', todayStart.toISOString());

    if (todayErr) throw todayErr;

    const { count: totalSessions, error: countErr } = await supabase
      .from('focus_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (countErr) throw countErr;

    const { data: history, error: historyErr } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (historyErr) throw historyErr;

    const weekMinutes = (weekSessions || []).reduce((sum, s) => sum + s.duration_min, 0);
    const todayMinutes = (todaySessions || []).reduce((sum, s) => sum + s.duration_min, 0);

    const formattedHistory = (history || []).map(h => ({
      _id: h.id,
      id: h.id,
      subject: h.subject,
      durationMin: h.duration_min,
      completed: h.completed,
      completedAt: h.completed_at
    }));

    return NextResponse.json({
      todayMinutes,
      weekMinutes,
      totalSessions: totalSessions || 0,
      weekSessionsCount: (weekSessions || []).length,
      sessions: formattedHistory,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, durationMin, completed } = await req.json();

    if (!durationMin || durationMin < 1) {
      return NextResponse.json({ error: 'durationMin is required' }, { status: 400 });
    }

    const sessionId = crypto.randomUUID();

    const { data: session, error } = await supabase
      .from('focus_sessions')
      .insert({
        id: sessionId,
        user_id: user.id,
        subject: subject || 'General',
        duration_min: durationMin,
        completed: completed !== false,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      session: {
        _id: session.id,
        id: session.id,
        subject: session.subject,
        durationMin: session.duration_min,
        completed: session.completed,
        completedAt: session.completed_at
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

