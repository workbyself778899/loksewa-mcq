import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * POST /api/questions/bulk
 * Bulk create questions (Admin only)
 * Body: { questions: [{ questionText, options, correctAnswer, explanation, questionSet }] }
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

    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: questions array is required and cannot be empty' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate each question in the array
    const validatedQuestions = [];
    for (const q of questions) {
      const { questionText, options, correctAnswer, explanation, questionSet } = q;

      if (!questionSet || !questionText || !options || correctAnswer === undefined) {
        return NextResponse.json(
          {
            error: `Missing required fields on a question: ${JSON.stringify(q)}`,
          },
          { status: 400 }
        );
      }

      if (!Array.isArray(options) || options.length !== 4) {
        return NextResponse.json(
          { error: `Options must have exactly 4 items for question: "${questionText}"` },
          { status: 400 }
        );
      }

      const correctAnsIdx = parseInt(correctAnswer);
      if (isNaN(correctAnsIdx) || correctAnsIdx < 0 || correctAnsIdx > 3) {
        return NextResponse.json(
          { error: `Correct answer index must be between 0 and 3 for question: "${questionText}"` },
          { status: 400 }
        );
      }

      validatedQuestions.push({
        questionSet,
        questionText,
        options,
        correctAnswer: correctAnsIdx,
        explanation: explanation || '',
        createdBy: payload.userId,
      });
    }

    // Insert all questions into the database
    const createdQuestions = await Question.insertMany(validatedQuestions);

    return NextResponse.json(
      {
        message: `${createdQuestions.length} questions created successfully`,
        questions: createdQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bulk create questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
