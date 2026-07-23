import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch semesters
    const { data: semesters, error: semError } = await supabase
      .from('semesters')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (semError) throw semError;

    // Fetch courses for these semesters
    const semesterIds = semesters.map(s => s.id);
    let courses = [];
    if (semesterIds.length > 0) {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .in('semester_id', semesterIds);
      
      if (courseError) throw courseError;
      courses = courseData;
    }

    // Nest courses inside semesters
    const result = semesters.map(sem => ({
      _id: sem.id,
      id: sem.id,
      name: sem.name,
      startDate: sem.start_date,
      endDate: sem.end_date,
      courses: courses.filter(c => c.semester_id === sem.id).map(c => ({
        _id: c.id,
        id: c.id,
        name: c.name,
        code: c.code,
        creditHours: c.credit_hours,
        targetGrade: c.target_grade,
        actualGrade: c.actual_grade
      }))
    }));

    return NextResponse.json({ semesters: result });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, startDate, endDate } = await req.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const semesterId = crypto.randomUUID();

    const { data: semester, error } = await supabase
      .from('semesters')
      .insert({
        id: semesterId,
        user_id: user.id,
        name,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      semester: {
        _id: semester.id,
        id: semester.id,
        name: semester.name,
        startDate: semester.start_date,
        endDate: semester.end_date,
        courses: []
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
