import type { HomePageContent } from '@/types/homePage';

/** Default home page content used when fields are missing in the database */
export const DEFAULT_HOME_PAGE: HomePageContent = {
  title: 'MCQ Learning Platform',
  tagline: 'Practice • Learn • Succeed',
  description:
    'Master your skills with our comprehensive MCQ platform. Take exams, track your progress, and improve your scores.',
  heroImage: '',
  heroImageAlt: 'Students learning online',
  showHeroImage: false,
  primaryCtaText: 'Get Started',
  primaryCtaLink: '/register',
  secondaryCtaText: 'Login',
  secondaryCtaLink: '/login',
  featuresTitle: 'Why Choose Our Platform?',
  featuresSubtitle: 'Everything you need to master your skills and ace your exams',
  features: [
    {
      title: 'Comprehensive Courses',
      description:
        'Multiple courses covering various topics with detailed question sets for thorough practice.',
      icon: 'FiBook',
      enabled: true,
    },
    {
      title: 'Practice Tests',
      description:
        'Multiple question sets for each course to practice and strengthen your knowledge daily.',
      icon: 'FiTarget',
      enabled: true,
    },
    {
      title: 'Track Progress',
      description:
        'View your scores, track improvement, and see detailed performance analytics in real-time.',
      icon: 'FiAward',
      enabled: true,
    },
  ],
  promoSections: [
    {
      title: 'Prepare for Real Exams',
      subtitle: 'Structured practice',
      description:
        'Our question sets mirror real exam patterns so you build confidence before the big day. Review answers after each test to learn from mistakes.',
      image: '',
      imagePosition: 'right',
      buttonText: 'Browse Courses',
      buttonLink: '/dashboard',
      enabled: true,
      order: 0,
    },
  ],
  showStats: true,
  stats: [
    { label: 'Question Sets', value: '50+', icon: 'FiLayers' },
    { label: 'Active Learners', value: '1000+', icon: 'FiUsers' },
    { label: 'Courses', value: '10+', icon: 'FiBook' },
    { label: 'Success Rate', value: '95%', icon: 'FiTrendingUp' },
  ],
  aboutTitle: 'About Our Platform',
  aboutContent:
    'We help students and professionals prepare through high-quality multiple-choice tests. Admins can add courses, question sets, and detailed explanations — you focus on learning.',
  coursesTitle: 'Available Courses',
  coursesSubtitle: 'Master your skills with our comprehensive course collection',
  ctaTitle: 'Ready to Start Testing?',
  ctaDescription:
    'Join thousands of learners improving their skills and acing their exams with our comprehensive MCQ platform.',
  ctaButtonText: 'Create Your Free Account',
  ctaButtonLink: '/register',
};

/** Merge database document with defaults so older records still render correctly */
export function mergeHomePage(doc: Record<string, unknown> | null): HomePageContent {
  if (!doc) {
    return { ...DEFAULT_HOME_PAGE };
  }

  const merged: HomePageContent = {
    ...DEFAULT_HOME_PAGE,
    title: (doc.title as string) ?? DEFAULT_HOME_PAGE.title,
    tagline: (doc.tagline as string) ?? DEFAULT_HOME_PAGE.tagline,
    description: (doc.description as string) ?? DEFAULT_HOME_PAGE.description,
    heroImage: (doc.heroImage as string) ?? '',
    heroImageAlt: (doc.heroImageAlt as string) ?? DEFAULT_HOME_PAGE.heroImageAlt,
    showHeroImage: (doc.showHeroImage as boolean) ?? false,
    primaryCtaText: (doc.primaryCtaText as string) ?? DEFAULT_HOME_PAGE.primaryCtaText,
    primaryCtaLink: (doc.primaryCtaLink as string) ?? DEFAULT_HOME_PAGE.primaryCtaLink,
    secondaryCtaText: (doc.secondaryCtaText as string) ?? DEFAULT_HOME_PAGE.secondaryCtaText,
    secondaryCtaLink: (doc.secondaryCtaLink as string) ?? DEFAULT_HOME_PAGE.secondaryCtaLink,
    featuresTitle: (doc.featuresTitle as string) ?? DEFAULT_HOME_PAGE.featuresTitle,
    featuresSubtitle: (doc.featuresSubtitle as string) ?? DEFAULT_HOME_PAGE.featuresSubtitle,
    features:
      Array.isArray(doc.features) && doc.features.length > 0
        ? (doc.features as HomePageContent['features'])
        : DEFAULT_HOME_PAGE.features,
    promoSections:
      Array.isArray(doc.promoSections) && doc.promoSections.length > 0
        ? (doc.promoSections as HomePageContent['promoSections'])
        : DEFAULT_HOME_PAGE.promoSections,
    showStats: (doc.showStats as boolean) ?? DEFAULT_HOME_PAGE.showStats,
    stats:
      Array.isArray(doc.stats) && doc.stats.length > 0
        ? (doc.stats as HomePageContent['stats'])
        : DEFAULT_HOME_PAGE.stats,
    aboutTitle: (doc.aboutTitle as string) ?? DEFAULT_HOME_PAGE.aboutTitle,
    aboutContent:
      (doc.aboutContent as string) ||
      (doc.content as string) ||
      DEFAULT_HOME_PAGE.aboutContent,
    coursesTitle: (doc.coursesTitle as string) ?? DEFAULT_HOME_PAGE.coursesTitle,
    coursesSubtitle: (doc.coursesSubtitle as string) ?? DEFAULT_HOME_PAGE.coursesSubtitle,
    ctaTitle: (doc.ctaTitle as string) ?? DEFAULT_HOME_PAGE.ctaTitle,
    ctaDescription: (doc.ctaDescription as string) ?? DEFAULT_HOME_PAGE.ctaDescription,
    ctaButtonText: (doc.ctaButtonText as string) ?? DEFAULT_HOME_PAGE.ctaButtonText,
    ctaButtonLink: (doc.ctaButtonLink as string) ?? DEFAULT_HOME_PAGE.ctaButtonLink,
  };

  return merged;
}
