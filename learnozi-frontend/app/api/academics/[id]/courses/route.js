import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const semesterId = params.id;
    const { name, code, creditHours, targetGrade, actualGrade } = await req.json();

    if (!name || !creditHours) {
      return NextResponse.json({ error: 'Course name and credit hours are required' }, { status: 400 });
    }

    const courseId = crypto.randomUUID();

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        id: courseId,
        semester_id: semesterId,
        name,
        code: code || '',
        credit_hours: parseInt(creditHours, 10),
        target_grade: targetGrade || '',
        actual_grade: actualGrade || '',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      course: {
        _id: course.id,
        id: course.id,
        name: course.name,
        code: course.code,
        creditHours: course.credit_hours,
        targetGrade: course.target_grade,
        actualGrade: course.actual_grade,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
