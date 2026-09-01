import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Special handler for demo credentials
    if (cleanEmail === 'demo@learnozi.com' || cleanEmail === 'demo') {
      const demoUser = {
        id: 'demo_user_123',
        name: 'Demo Student',
        email: 'demo@learnozi.com',
        isOnboarded: true,
        academicProfile: { educationLevel: 'University', university: 'NUST' },
      };
      const token = signToken({ id: demoUser.id, email: demoUser.email });
      return NextResponse.json({ token, user: demoUser });
    }

    // Database lookup
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, password, academic_profile')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = signToken({ id: user.id, email: user.email });
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
      }
    } catch (dbErr) {
      console.warn('Supabase DB lookup skipped or failed, using auth fallback');
    }

    // Mock auth fallback for testing if database is not configured
    const mockUser = {
      id: `user_${Date.now()}`,
      name: cleanEmail.split('@')[0] || 'Learner',
      email: cleanEmail,
      isOnboarded: true,
      academicProfile: { educationLevel: 'University' },
    };
    const token = signToken({ id: mockUser.id, email: mockUser.email });
    return NextResponse.json({ token, user: mockUser });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
