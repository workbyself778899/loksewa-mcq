import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/utils/jwt';

/**
 * POST /api/auth/login
 * Login user and return JWT token
 * Body: { email, password }
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return success response
    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
