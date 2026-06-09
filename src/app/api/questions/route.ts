import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';
import QuestionSet from '@/models/QuestionSet';
import User from '@/models/User';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/questions
 * Get all questions or filter by question set
 * Query: ?questionSetId=<id>
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const questionSetId = searchParams.get('questionSetId');

    // Build filter object
    const filter = questionSetId ? { questionSet: questionSetId } : {};

    // Same order as test submission (oldest first) so answer indices stay aligned
    const questions = await Question.find(filter)
      .populate('questionSet', 'name')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: 1 });

    // Only admins see correct answers during fetch; users get them after test via review API
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    let isAdmin = false;
    if (token) {
      const payload = verifyToken(token);
      if (payload?.role === 'admin') {
        isAdmin = true;
      }
    }

    const safeQuestions = questions.map((q) => {
      const doc = q.toObject();
      if (!isAdmin) {
        delete doc.correctAnswer;
        delete doc.explanation;
      }
      return doc;
    });

    return NextResponse.json(
      {
        message: 'Questions fetched successfully',
        questions: safeQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/questions
 * Create new question (Admin only)
 * Body: { questionSet, questionText, options, correctAnswer, explanation }
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

    const { questionSet, question: questionField, questionText: questionTextField, options, correctAnswer, explanation } =
      await request.json();

    // Use 'question' if provided, otherwise use 'questionText' (for compatibility)
    const finalQuestionText = questionField || questionTextField;

    // Validate required fields
    if (!questionSet || !finalQuestionText || !options || correctAnswer === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: questionSet, question/questionText, options, correctAnswer',
        },
        { status: 400 }
      );
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: 'Options must be an array of exactly 4 items' },
        { status: 400 }
      );
    }

    // Validate correct answer index
    if (correctAnswer < 0 || correctAnswer > 3) {
      return NextResponse.json(
        { error: 'Correct answer must be between 0 and 3' },
        { status: 400 }
      );
    }

    // Create new question
    const newQuestion = new Question({
      questionSet,
      questionText: finalQuestionText,
      options,
      correctAnswer,
      explanation: explanation || '',
      createdBy: payload.userId,
    });

    await newQuestion.save();

    return NextResponse.json(
      {
        message: 'Question created successfully',
        question: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
