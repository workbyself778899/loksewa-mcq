import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/courses
 * Get all courses
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all courses with creator info
    const courses = await Course.find().populate('createdBy', 'fullName email');

    return NextResponse.json(
      {
        message: 'Courses fetched successfully',
        courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create new course (Admin only)
 * Body: { name, description, image }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { name, description, image } = await request.json();

    // Validate required fields
    if (!name || !description || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, image' },
        { status: 400 }
      );
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this name already exists' },
        { status: 400 }
      );
    }

    // Create new course
    const course = new Course({
      name,
      description,
      image,
      createdBy: payload.userId,
    });

    await course.save();

    return NextResponse.json(
      {
        message: 'Course created successfully',
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
