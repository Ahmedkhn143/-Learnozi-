import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const { actualGrade } = await req.json();

    const { data: course, error } = await supabase
      .from('courses')
      .update({ actual_grade: actualGrade })
      .eq('id', courseId)
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
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
