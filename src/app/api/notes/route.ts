import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/notes
 * Fetch all notes
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch notes and populate creator info
    const notes = await Note.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: 'Notes fetched successfully',
        notes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Create a new note (Admin only)
 * Body: { title, description, link }
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

    const { title, description, link } = await request.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }

    // Create new note
    const note = new Note({
      title,
      description,
      link: link || '',
      createdBy: payload.userId,
    });

    await note.save();

    return NextResponse.json(
      {
        message: 'Note created successfully',
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes
 * Delete a note (Admin only)
 * Query: ?id=<noteId>
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    await connectDB();

    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Note deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
