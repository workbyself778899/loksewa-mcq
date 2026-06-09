import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/utils/jwt';

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email, password, fullName }
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const { email, password, fullName } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, fullName' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
      role: 'user', // Default role is user
    });

    // Save user (password will be hashed by middleware)
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return success response
    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
