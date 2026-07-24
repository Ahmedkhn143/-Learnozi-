import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, academic_profile')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ id: user.id });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isOnboarded: !!(user.academic_profile && user.academic_profile.educationLevel),
        academicProfile: user.academic_profile,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
