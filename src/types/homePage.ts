/** Feature card shown in the "Why choose us" section */
export interface HomeFeature {
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

/** Promotional block with image + text for marketing the site */
export interface HomePromoSection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition: 'left' | 'right';
  buttonText: string;
  buttonLink: string;
  enabled: boolean;
  order: number;
}

/** Stat counter / highlight (e.g. "5000+ Students") */
export interface HomeStat {
  label: string;
  value: string;
  icon: string;
}

/** Full home page content controlled by admin */
export interface HomePageContent {
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  showHeroImage: boolean;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: HomeFeature[];
  promoSections: HomePromoSection[];
  showStats: boolean;
  stats: HomeStat[];
  aboutTitle: string;
  aboutContent: string;
  coursesTitle: string;
  coursesSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  /** Legacy field — mapped to aboutContent when loading old data */
  content?: string;
}
