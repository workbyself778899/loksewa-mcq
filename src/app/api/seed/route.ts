import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

/**
 * POST /api/seed
 * Seed database with sample data (Development only)
 * Query: ?reset=true to force reset and reseed
 * WARNING: This endpoint should be removed in production
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset') === 'true';

    // If reset is requested, delete all courses
    if (reset) {
      await Course.deleteMany({});
    }

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0 && !reset) {
      return NextResponse.json(
        { message: 'Database already seeded with courses', coursesCount: existingCourses },
        { status: 200 }
      );
    }

    // Get or create a default admin user
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      adminUser = new User({
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed by middleware
        fullName: 'Admin User',
        role: 'admin',
      });
      await adminUser.save();
    }

    // Sample courses data
    const sampleCourses = [
      {
        name: 'Computer Operator',
        description:
          'Master the fundamentals of computer operations. Learn about hardware, software, MS Office, Internet, and practical typing skills.',
        image:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
      {
        name: 'English Language',
        description:
          'Enhance your English skills with grammar, vocabulary, reading comprehension, and writing techniques. Perfect for competitive exams.',
        image:
          'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
      {
        name: 'Mathematics Basics',
        description:
          'Build strong foundation in mathematics covering arithmetic, algebra, geometry, and practical problem-solving skills.',
        image:
          'https://images.unsplash.com/photo-1509228627152-72ae9e29f773?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
      {
        name: 'General Knowledge',
        description:
          'Expand your general knowledge about history, geography, science, current affairs, and interesting facts from around the world.',
        image:
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
      {
        name: 'Reasoning & Logic',
        description:
          'Develop logical thinking and problem-solving abilities with various reasoning puzzles and analytical questions.',
        image:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
      {
        name: 'Science & Technology',
        description:
          'Explore fascinating topics in physics, chemistry, biology, and modern technology. Updated with latest developments.',
        image:
          'https://images.unsplash.com/photo-1530693737987-381d20c9be65?w=500&h=300&fit=crop',
        createdBy: adminUser._id,
      },
    ];

    // Insert sample courses
    await Course.insertMany(sampleCourses);

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        coursesCreated: sampleCourses.length,
        courses: sampleCourses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed
 * Get seed status
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const coursesCount = await Course.countDocuments();
    const usersCount = await User.countDocuments();

    return NextResponse.json(
      {
        message: 'Database status',
        statistics: {
          courses: coursesCount,
          users: usersCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get seed status error:', error);
    return NextResponse.json(
      { error: 'Failed to get database status' },
      { status: 500 }
    );
  }
}
