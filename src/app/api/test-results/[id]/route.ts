import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import Question from '@/models/Question';
import { buildTestReview } from '@/lib/buildTestReview';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/test-results/[id]
 * Returns a single test attempt with full answer review (correct options + explanations).
 * Only the result owner or an admin may access this.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const testResult = await TestResult.findById(id)
      .populate('questionSet', 'name')
      .populate('user', 'fullName email');

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 });
    }

    // Users may only review their own attempts; admins may view any
    const resultOwnerId = String(
      (testResult.user as { _id?: { toString(): string } })._id ?? testResult.user
    );
    if (payload.role !== 'admin' && resultOwnerId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const questions = await Question.find({
      questionSet: testResult.questionSet._id,
    }).sort({ createdAt: 1 });

    const review = buildTestReview(questions, testResult.answers, testResult.notes);

    return NextResponse.json(
      {
        message: 'Test review fetched successfully',
        result: {
          _id: testResult._id,
          score: testResult.score,
          totalMarks: testResult.totalMarks,
          totalQuestions: testResult.totalQuestions,
          correctAnswers: testResult.correctAnswers,
          wrongAnswers: testResult.wrongAnswers,
          unanswered: testResult.unanswered,
          marksPerQuestion: testResult.marksPerQuestion,
          negativeMarks: testResult.negativeMarks,
          percentage: testResult.percentage,
          timeSpent: testResult.timeSpent,
          completedAt: testResult.completedAt,
          questionSet: testResult.questionSet,
          generalNotes: testResult.generalNotes || '',
        },
        review,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch test review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
