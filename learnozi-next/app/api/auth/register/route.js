import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = await User.create({
      name,
      email,
      password,
      isVerified: true, // auto-verify for smooth dev & direct login
      isOnboarded: false,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isOnboarded: user.isOnboarded,
          academicProfile: user.academicProfile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
