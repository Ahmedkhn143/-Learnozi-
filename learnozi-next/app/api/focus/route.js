import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FocusSession from '@/lib/models/FocusSession';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = user._id;
    const now = new Date();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [weekSessions, todaySessions, totalSessions, history] = await Promise.all([
      FocusSession.find({ user: userId, completedAt: { $gte: weekAgo }, completed: true }),
      FocusSession.find({ user: userId, completedAt: { $gte: todayStart }, completed: true }),
      FocusSession.countDocuments({ user: userId, completed: true }),
      FocusSession.find({ user: userId, completed: true }).sort({ completedAt: -1 }).limit(20),
    ]);

    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMin, 0);

    return NextResponse.json({
      todayMinutes,
      weekMinutes,
      totalSessions,
      weekSessionsCount: weekSessions.length,
      sessions: history,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { subject, durationMin, completed } = await req.json();

    if (!durationMin || durationMin < 1) {
      return NextResponse.json({ error: 'durationMin is required' }, { status: 400 });
    }

    const session = await FocusSession.create({
      user: user._id,
      subject: subject || 'General',
      durationMin,
      completed: completed !== false,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
