import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionSet from '@/models/QuestionSet';
import Course from '@/models/Course';
import User from '@/models/User';
import Question from '@/models/Question';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/question-sets
 * Get all question sets or filter by course
 * Query: ?courseId=<id>
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Build filter object
    const filter = courseId ? { course: courseId } : {};

    // Fetch question sets
    const questionSets = await QuestionSet.find(filter)
      .populate('course', 'name')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    // Populate question counts
    const questionSetsWithCounts = await Promise.all(
      questionSets.map(async (set) => {
        const questionCount = await Question.countDocuments({ questionSet: set._id });
        const doc = set.toObject();
        return {
          ...doc,
          questionCount,
        };
      })
    );

    return NextResponse.json(
      {
        message: 'Question sets fetched successfully',
        questionSets: questionSetsWithCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch question sets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/question-sets
 * Create new question set (Admin only)
 * Body: { course, name, description, marksPerQuestion, negativeMarks }
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

    const { course, name, description, marksPerQuestion, negativeMarks } = await request.json();

    // Validate required fields
    if (!course || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: course, name' },
        { status: 400 }
      );
    }

    // Create new question set
    const questionSet = new QuestionSet({
      course,
      name,
      description: description || '',
      marksPerQuestion: marksPerQuestion || 1,
      negativeMarks: negativeMarks || 0,
      createdBy: payload.userId,
    });

    await questionSet.save();

    return NextResponse.json(
      {
        message: 'Question set created successfully',
        questionSet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create question set error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
