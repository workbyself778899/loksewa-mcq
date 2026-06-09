import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import Question from '@/models/Question';
import QuestionSet from '@/models/QuestionSet';
import { buildTestReview } from '@/lib/buildTestReview';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/test-results
 * Get user's test results or all results (admin)
 * Query: ?questionSetId=<id> - filter by question set
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    const { searchParams } = new URL(request.url);
    const questionSetId = searchParams.get('questionSetId');

    // Build filter - users can only see their own results, admins see all
    const filter =
      payload.role === 'admin'
        ? questionSetId ? { questionSet: questionSetId } : {}
        : { user: payload.userId, ...(questionSetId && { questionSet: questionSetId }) };

    // Fetch test results
    const results = await TestResult.find(filter)
      .populate('user', 'fullName email')
      .populate('questionSet', 'name')
      .sort({ completedAt: -1 });

    return NextResponse.json(
      {
        message: 'Test results fetched successfully',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch test results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-results
 * Submit test and save results
 * Body: { questionSetId, answers, timeSpent }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    const { questionSetId, answers, timeSpent } = await request.json();

    // Validate required fields
    if (!questionSetId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          error: 'Missing or invalid required fields: questionSetId, answers (array)',
        },
        { status: 400 }
      );
    }

    // Fetch all questions for the question set
    const questions = await Question.find({ questionSet: questionSetId }).sort({
      createdAt: 1,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this question set' },
        { status: 404 }
      );
    }

    // Fetch question set to get marks and negative marking info
    const questionSet = await QuestionSet.findById(questionSetId);
    const marksPerQuestion = questionSet?.marksPerQuestion || 1;
    const negativeMarks = questionSet?.negativeMarks || 0;

    // Validate answers array length
    if (answers.length !== questions.length) {
      return NextResponse.json(
        {
          error: `Expected ${questions.length} answers, got ${answers.length}`,
        },
        { status: 400 }
      );
    }

    // Calculate score with marks and negative marking
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    answers.forEach((answer: number, index: number) => {
      if (answer === -1) {
        unansweredCount++;
      } else if (answer === questions[index].correctAnswer) {
        score += marksPerQuestion;
        correctCount++;
      } else {
        score -= negativeMarks;
        wrongCount++;
      }
    });

    // Ensure score doesn't go negative
    score = Math.max(0, score);

    // Calculate total marks and percentage
    const totalMarks = questions.length * marksPerQuestion;
    const percentage = (score / totalMarks) * 100;

    // Create test result
    const testResult = new TestResult({
      user: payload.userId,
      questionSet: questionSetId,
      answers,
      score,
      totalMarks,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      marksPerQuestion,
      negativeMarks,
      percentage,
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
    });

    await testResult.save();

    // Include answer review only after submission (not exposed during the test)
    const review = buildTestReview(questions, answers);

    return NextResponse.json(
      {
        message: 'Test result saved successfully',
        result: {
          _id: testResult._id,
          score: score.toFixed(2),
          totalMarks,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          unanswered: unansweredCount,
          marksPerQuestion,
          negativeMarks,
          percentage: percentage.toFixed(2),
          timeSpent,
        },
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
