'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { DEFAULT_HOME_PAGE, mergeHomePage } from '@/lib/homePageDefaults';
import { HOME_ICON_OPTIONS } from '@/lib/homePageIcons';
import type { HomeFeature, HomePageContent, HomePromoSection, HomeStat } from '@/types/homePage';
import {
  FiArrowLeft,
  FiArrowDown,
  FiArrowUp,
  FiExternalLink,
  FiPlus,
  FiSave,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const inputClass = (isDark: boolean) =>
  `w-full px-4 py-2 rounded-lg border transition outline-none ${
    isDark
      ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white'
      : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900'
  }`;

const cardClass = (isDark: boolean) =>
  `rounded-lg p-4 sm:p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`;

/**
 * Full home page CMS — hero, features, promo blocks, stats, about, and CTA sections
 */
export default function HomeEditorPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<HomePageContent>(DEFAULT_HOME_PAGE);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchHomePage = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/home');
        if (res.ok) {
          const data = await res.json();
          setFormData(mergeHomePage(data.homePage));
        }
      } catch (error) {
        console.error('Error fetching home page:', error);
        toast.error('Failed to load home page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomePage();
  }, [isAuthenticated, user, router]);

  const updateField = <K extends keyof HomePageContent>(key: K, value: HomePageContent[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateFeature = (index: number, patch: Partial<HomeFeature>) => {
    const next = [...formData.features];
    next[index] = { ...next[index], ...patch };
    updateField('features', next);
  };

  const addFeature = () => {
    updateField('features', [
      ...formData.features,
      { title: 'New Feature', description: '', icon: 'FiStar', enabled: true },
    ]);
  };

  const removeFeature = (index: number) => {
    updateField(
      'features',
      formData.features.filter((_, i) => i !== index)
    );
  };

  const updatePromo = (index: number, patch: Partial<HomePromoSection>) => {
    const next = [...formData.promoSections];
    next[index] = { ...next[index], ...patch };
    updateField('promoSections', next);
  };

  const addPromo = () => {
    updateField('promoSections', [
      ...formData.promoSections,
      {
        title: 'New Promotion',
        subtitle: '',
        description: '',
        image: '',
        imagePosition: 'right',
        buttonText: 'Learn More',
        buttonLink: '/',
        enabled: true,
        order: formData.promoSections.length,
      },
    ]);
  };

  const removePromo = (index: number) => {
    updateField(
      'promoSections',
      formData.promoSections.filter((_, i) => i !== index)
    );
  };

  const movePromo = (index: number, direction: 'up' | 'down') => {
    const next = [...formData.promoSections];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    next.forEach((p, i) => (p.order = i));
    updateField('promoSections', next);
  };

  const updateStat = (index: number, patch: Partial<HomeStat>) => {
    const next = [...formData.stats];
    next[index] = { ...next[index], ...patch };
    updateField('stats', next);
  };

  const addStat = () => {
    updateField('stats', [...formData.stats, { label: 'Label', value: '100+', icon: 'FiStar' }]);
  };

  const removeStat = (index: number) => {
    updateField(
      'stats',
      formData.stats.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update home page');
      }
      const data = await res.json();
      setFormData(mergeHomePage(data.homePage));
      toast.success('Home page updated successfully!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{children}</label>
      {hint && <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{hint}</p>}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 ${isDark ? 'text-white' : 'text-gray-600'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4">
              <FiArrowLeft /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold">Home Page Builder</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Customize every section to promote your website — hero, features, promos, stats, and more
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FiExternalLink /> Preview Site
          </Link>
        </div>

        {isLoading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hero */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-4">Hero Section</h2>
              <Label hint="Main headline visitors see first">Title</Label>
              <input
                className={inputClass(isDark)}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
              <Label hint="Short badge above or below title (e.g. Practice • Learn • Succeed)">Tagline</Label>
              <input
                className={inputClass(isDark)}
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
              />
              <Label hint="Supporting paragraph under the title">Description</Label>
              <textarea
                className={inputClass(isDark)}
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label hint="Primary button (e.g. Get Started)">Primary CTA text</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.primaryCtaText}
                    onChange={(e) => updateField('primaryCtaText', e.target.value)}
                  />
                </div>
                <div>
                  <Label hint="Link path, e.g. /register or /dashboard">Primary CTA link</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.primaryCtaLink}
                    onChange={(e) => updateField('primaryCtaLink', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Secondary CTA text</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.secondaryCtaText}
                    onChange={(e) => updateField('secondaryCtaText', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Secondary CTA link</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.secondaryCtaLink}
                    onChange={(e) => updateField('secondaryCtaLink', e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showHeroImage}
                  onChange={(e) => updateField('showHeroImage', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show hero image</span>
              </label>
              {formData.showHeroImage && (
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Hero image URL</Label>
                    <input
                      className={inputClass(isDark)}
                      value={formData.heroImage}
                      onChange={(e) => updateField('heroImage', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Image alt text (accessibility)</Label>
                    <input
                      className={inputClass(isDark)}
                      value={formData.heroImageAlt}
                      onChange={(e) => updateField('heroImageAlt', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Stats */}
            <section className={cardClass(isDark)}>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h2 className="text-xl font-bold">Stats Bar</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showStats}
                    onChange={(e) => updateField('showStats', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show on home page</span>
                </label>
              </div>
              {formData.stats.map((stat, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Stat #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input
                      className={inputClass(isDark)}
                      placeholder="Value (e.g. 1000+)"
                      value={stat.value}
                      onChange={(e) => updateStat(index, { value: e.target.value })}
                    />
                    <input
                      className={inputClass(isDark)}
                      placeholder="Label"
                      value={stat.label}
                      onChange={(e) => updateStat(index, { label: e.target.value })}
                    />
                    <select
                      className={inputClass(isDark)}
                      value={stat.icon}
                      onChange={(e) => updateStat(index, { icon: e.target.value })}
                    >
                      {HOME_ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addStat}
                className="flex items-center gap-2 text-blue-500 font-semibold text-sm"
              >
                <FiPlus /> Add stat
              </button>
            </section>

            {/* Features */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-4">Features Section</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Section title</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.featuresTitle}
                    onChange={(e) => updateField('featuresTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Section subtitle</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.featuresSubtitle}
                    onChange={(e) => updateField('featuresSubtitle', e.target.value)}
                  />
                </div>
              </div>
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={feature.enabled}
                        onChange={(e) => updateFeature(index, { enabled: e.target.checked })}
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className={inputClass(isDark)}
                      placeholder="Title"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, { title: e.target.value })}
                    />
                    <select
                      className={inputClass(isDark)}
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, { icon: e.target.value })}
                    >
                      {HOME_ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className={`${inputClass(isDark)} mt-3`}
                    rows={2}
                    placeholder="Description"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, { description: e.target.value })}
                  />
                </div>
              ))}
              <button type="button" onClick={addFeature} className="flex items-center gap-2 text-blue-500 font-semibold">
                <FiPlus /> Add feature card
              </button>
            </section>

            {/* Promo sections */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-2">Promotional Blocks</h2>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Add detailed sections with image + text to promote courses, offers, or your brand story
              </p>
              {formData.promoSections.map((promo, index) => (
                <div
                  key={index}
                  className={`mb-6 p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={promo.enabled}
                        onChange={(e) => updatePromo(index, { enabled: e.target.checked })}
                      />
                      Show block
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => movePromo(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded bg-gray-600/30 disabled:opacity-40"
                      >
                        <FiArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePromo(index, 'down')}
                        disabled={index === formData.promoSections.length - 1}
                        className="p-2 rounded bg-gray-600/30 disabled:opacity-40"
                      >
                        <FiArrowDown />
                      </button>
                      <button type="button" onClick={() => removePromo(index)} className="text-red-500 p-2">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      className={inputClass(isDark)}
                      placeholder="Title"
                      value={promo.title}
                      onChange={(e) => updatePromo(index, { title: e.target.value })}
                    />
                    <input
                      className={inputClass(isDark)}
                      placeholder="Subtitle"
                      value={promo.subtitle}
                      onChange={(e) => updatePromo(index, { subtitle: e.target.value })}
                    />
                    <textarea
                      className={inputClass(isDark)}
                      rows={4}
                      placeholder="Long description for promotion..."
                      value={promo.description}
                      onChange={(e) => updatePromo(index, { description: e.target.value })}
                    />
                    <input
                      className={inputClass(isDark)}
                      placeholder="Image URL"
                      value={promo.image}
                      onChange={(e) => updatePromo(index, { image: e.target.value })}
                    />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <select
                        className={inputClass(isDark)}
                        value={promo.imagePosition}
                        onChange={(e) =>
                          updatePromo(index, { imagePosition: e.target.value as 'left' | 'right' })
                        }
                      >
                        <option value="left">Image on left</option>
                        <option value="right">Image on right</option>
                      </select>
                      <input
                        className={inputClass(isDark)}
                        placeholder="Button text"
                        value={promo.buttonText}
                        onChange={(e) => updatePromo(index, { buttonText: e.target.value })}
                      />
                      <input
                        className={inputClass(isDark)}
                        placeholder="Button link (/dashboard)"
                        value={promo.buttonLink}
                        onChange={(e) => updatePromo(index, { buttonLink: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addPromo} className="flex items-center gap-2 text-blue-500 font-semibold">
                <FiPlus /> Add promotional block
              </button>
            </section>

            {/* About */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-4">About Section</h2>
              <Label>Section title</Label>
              <input
                className={inputClass(isDark)}
                value={formData.aboutTitle}
                onChange={(e) => updateField('aboutTitle', e.target.value)}
              />
              <Label hint="Tell visitors about your mission, team, or what makes your platform unique">
                About content
              </Label>
              <textarea
                className={inputClass(isDark)}
                rows={6}
                value={formData.aboutContent}
                onChange={(e) => updateField('aboutContent', e.target.value)}
              />
            </section>

            {/* Courses section headers */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-4">Courses Section Labels</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title (course list still loads from database)</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.coursesTitle}
                    onChange={(e) => updateField('coursesTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <input
                    className={inputClass(isDark)}
                    value={formData.coursesSubtitle}
                    onChange={(e) => updateField('coursesSubtitle', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Bottom CTA */}
            <section className={cardClass(isDark)}>
              <h2 className="text-xl font-bold mb-4">Bottom Call-to-Action</h2>
              <input
                className={`${inputClass(isDark)} mb-3`}
                placeholder="CTA title"
                value={formData.ctaTitle}
                onChange={(e) => updateField('ctaTitle', e.target.value)}
              />
              <textarea
                className={`${inputClass(isDark)} mb-3`}
                rows={3}
                placeholder="CTA description"
                value={formData.ctaDescription}
                onChange={(e) => updateField('ctaDescription', e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className={inputClass(isDark)}
                  placeholder="Button text"
                  value={formData.ctaButtonText}
                  onChange={(e) => updateField('ctaButtonText', e.target.value)}
                />
                <input
                  className={inputClass(isDark)}
                  placeholder="Button link"
                  value={formData.ctaButtonLink}
                  onChange={(e) => updateField('ctaButtonLink', e.target.value)}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full sticky bottom-4 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-lg shadow-lg transition ${
                isDark
                  ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white'
                  : 'bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white'
              }`}
            >
              <FiSave /> {isSaving ? 'Saving...' : 'Save All Home Page Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
