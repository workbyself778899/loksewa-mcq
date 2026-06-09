import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * POST /api/admin/setup
 * Create a default admin user or upgrade existing user to admin
 * Body: { email, password, fullName } for creation
 * or { email } to upgrade existing user to admin
 * 
 * Development only - should be removed or protected in production
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, fullName, action } = body;

    // Action to upgrade existing user to admin
    if (action === 'upgrade' && email) {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      user.role = 'admin';
      await user.save();

      return NextResponse.json(
        { message: 'User upgraded to admin', user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } },
        { status: 200 }
      );
    }

    // Create new admin user
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
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create admin user
    const adminUser = new User({
      email,
      password,
      fullName,
      role: 'admin',
    });

    await adminUser.save();

    return NextResponse.json(
      { 
        message: 'Admin user created successfully', 
        user: { 
          id: adminUser._id, 
          email: adminUser.email, 
          fullName: adminUser.fullName, 
          role: adminUser.role 
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/setup
 * Get admin setup status
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const adminsCount = await User.countDocuments({ role: 'admin' });
    const usersCount = await User.countDocuments();

    return NextResponse.json(
      {
        adminsCount,
        usersCount,
        needsSetup: adminsCount === 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin setup' },
      { status: 500 }
    );
  }
}
