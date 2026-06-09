import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomePage from '@/models/HomePage';
import { mergeHomePage } from '@/lib/homePageDefaults';
import type { HomePageContent } from '@/types/homePage';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * GET /api/home
 * Returns merged home page content (DB + defaults for missing fields)
 */
export async function GET() {
  try {
    await connectDB();

    let homePage = await HomePage.findOne();

    if (!homePage) {
      homePage = new HomePage({
        title: 'MCQ Platform',
        description: 'Test your knowledge with our comprehensive MCQ platform',
      });
      await homePage.save();
    }

    const merged = mergeHomePage(homePage.toObject());

    return NextResponse.json(
      {
        message: 'Home page content fetched successfully',
        homePage: merged,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch home page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/home
 * Admin updates full home page CMS payload
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = (await request.json()) as Partial<HomePageContent>;

    let homePage = await HomePage.findOne();
    if (!homePage) {
      homePage = new HomePage({});
    }

    const assign = <K extends keyof HomePageContent>(key: K, value: HomePageContent[K] | undefined) => {
      if (value !== undefined) {
        (homePage as unknown as Record<string, unknown>)[key as string] = value;
      }
    };

    assign('title', body.title);
    assign('tagline', body.tagline);
    assign('description', body.description);
    assign('heroImage', body.heroImage);
    assign('heroImageAlt', body.heroImageAlt);
    assign('showHeroImage', body.showHeroImage);
    assign('primaryCtaText', body.primaryCtaText);
    assign('primaryCtaLink', body.primaryCtaLink);
    assign('secondaryCtaText', body.secondaryCtaText);
    assign('secondaryCtaLink', body.secondaryCtaLink);
    assign('featuresTitle', body.featuresTitle);
    assign('featuresSubtitle', body.featuresSubtitle);
    assign('features', body.features);
    assign('promoSections', body.promoSections);
    assign('showStats', body.showStats);
    assign('stats', body.stats);
    assign('aboutTitle', body.aboutTitle);
    assign('aboutContent', body.aboutContent);
    assign('coursesTitle', body.coursesTitle);
    assign('coursesSubtitle', body.coursesSubtitle);
    assign('ctaTitle', body.ctaTitle);
    assign('ctaDescription', body.ctaDescription);
    assign('ctaButtonText', body.ctaButtonText);
    assign('ctaButtonLink', body.ctaButtonLink);

    if (body.aboutContent !== undefined) {
      homePage.content = body.aboutContent;
    }

    homePage.updatedBy = payload.userId;
    await homePage.save();

    const merged = mergeHomePage(homePage.toObject());

    return NextResponse.json(
      { message: 'Home page updated successfully', homePage: merged },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update home page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
