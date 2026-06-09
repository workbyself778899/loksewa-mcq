import mongoose, { Document, Schema, Types } from 'mongoose';

const featureSchema = new Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, default: 'FiBook' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const promoSectionSchema = new Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePosition: { type: String, enum: ['left', 'right'], default: 'right' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const statSchema = new Schema(
  {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    icon: { type: String, default: 'FiStar' },
  },
  { _id: false }
);

export interface IHomePage extends Document {
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
  features: Array<{
    title: string;
    description: string;
    icon: string;
    enabled: boolean;
  }>;
  promoSections: Array<{
    title: string;
    subtitle: string;
    description: string;
    image: string;
    imagePosition: 'left' | 'right';
    buttonText: string;
    buttonLink: string;
    enabled: boolean;
    order: number;
  }>;
  showStats: boolean;
  stats: Array<{ label: string; value: string; icon: string }>;
  aboutTitle: string;
  aboutContent: string;
  content: string;
  coursesTitle: string;
  coursesSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const homePageSchema = new Schema<IHomePage>(
  {
    title: { type: String, default: 'MCQ Website' },
    tagline: { type: String, default: '' },
    description: {
      type: String,
      default: 'Test your knowledge with our comprehensive MCQ platform',
    },
    heroImage: { type: String, default: '' },
    heroImageAlt: { type: String, default: '' },
    showHeroImage: { type: Boolean, default: false },
    primaryCtaText: { type: String, default: 'Get Started' },
    primaryCtaLink: { type: String, default: '/register' },
    secondaryCtaText: { type: String, default: 'Login' },
    secondaryCtaLink: { type: String, default: '/login' },
    featuresTitle: { type: String, default: 'Why Choose Our Platform?' },
    featuresSubtitle: { type: String, default: '' },
    features: { type: [featureSchema], default: [] },
    promoSections: { type: [promoSectionSchema], default: [] },
    showStats: { type: Boolean, default: true },
    stats: { type: [statSchema], default: [] },
    aboutTitle: { type: String, default: 'About Our Platform' },
    aboutContent: { type: String, default: '' },
    content: { type: String, default: '' },
    coursesTitle: { type: String, default: 'Available Courses' },
    coursesSubtitle: { type: String, default: '' },
    ctaTitle: { type: String, default: 'Ready to Start Testing?' },
    ctaDescription: { type: String, default: '' },
    ctaButtonText: { type: String, default: 'Create Your Free Account' },
    ctaButtonLink: { type: String, default: '/register' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const HomePage =
  mongoose.models.HomePage || mongoose.model<IHomePage>('HomePage', homePageSchema);

export default HomePage;
