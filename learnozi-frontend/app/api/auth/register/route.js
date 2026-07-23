import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        academic_profile: {
          educationLevel: null,
          fieldOfStudy: '',
          currentYear: '',
          institution: '',
        },
        preferences: {
          studyHoursPerDay: 4,
          subjects: [],
        },
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      {
        message: 'Account created successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isOnboarded: false,
          academicProfile: user.academic_profile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
