import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionSet from '@/models/QuestionSet';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/question-sets/[id]
 * Get a specific question set
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    const questionSet = await QuestionSet.findById(id)
      .populate('course', 'name')
      .populate('createdBy', 'fullName');

    if (!questionSet) {
      return NextResponse.json(
        { error: 'Question set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question set fetched successfully',
        questionSet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch question set error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/question-sets/[id]
 * Update question set (Admin only)
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

    const { name, description } = await request.json();

    // Find and update question set
    const questionSet = await QuestionSet.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!questionSet) {
      return NextResponse.json(
        { error: 'Question set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question set updated successfully',
        questionSet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update question set error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/question-sets/[id]
 * Delete question set (Admin only)
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

    // Find and delete question set
    const questionSet = await QuestionSet.findByIdAndDelete(id);

    if (!questionSet) {
      return NextResponse.json(
        { error: 'Question set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question set deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete question set error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
