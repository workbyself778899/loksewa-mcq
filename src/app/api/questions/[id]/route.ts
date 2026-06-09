import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * PUT /api/questions/[id]
 * Update question (Admin only)
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

    const { question: questionField, questionText: questionTextField, options, correctAnswer, explanation } =
      await request.json();

    // Use 'question' if provided, otherwise use 'questionText' (for compatibility)
    const finalQuestionText = questionField || questionTextField;

    // Validate options array if provided
    if (options && (!Array.isArray(options) || options.length !== 4)) {
      return NextResponse.json(
        { error: 'Options must be an array of exactly 4 items' },
        { status: 400 }
      );
    }

    // Validate correct answer index if provided
    if (correctAnswer !== undefined && (correctAnswer < 0 || correctAnswer > 3)) {
      return NextResponse.json(
        { error: 'Correct answer must be between 0 and 3' },
        { status: 400 }
      );
    }

    // Find and update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        ...(finalQuestionText && { questionText: finalQuestionText }),
        ...(options && { options }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question updated successfully',
        question: updatedQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questions/[id]
 * Delete question (Admin only)
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

    // Find and delete question
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Question deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
