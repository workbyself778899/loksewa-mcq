import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { extractToken, verifyToken } from '@/utils/jwt';
import { Types } from 'mongoose';

/**
 * GET /api/courses/[id]
 * Get a specific course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    const course = await Course.findById(id).populate('createdBy', 'fullName email');

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Course fetched successfully',
        course,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Destructure and await the async params
    const { id } = await params;

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

    // Find and update course
    const course = await Course.findByIdAndUpdate(
      id,
      { name, description, image },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Course updated successfully',
        course,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Destructure and await the async params
    const { id } = await params;

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

    // Find and delete course
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Course deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
