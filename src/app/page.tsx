'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { HomePageIcon } from '@/lib/homePageIcons';
import { DEFAULT_HOME_PAGE, mergeHomePage } from '@/lib/homePageDefaults';
import type { HomePageContent } from '@/types/homePage';
import { FiArrowRight, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
}

/**
 * Public home page — content driven by admin Home Page Builder
 */
export default function Home() {
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [home, setHome] = useState<HomePageContent>(DEFAULT_HOME_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [homeRes, coursesRes] = await Promise.all([
          fetch('/api/home'),
          fetch('/api/courses'),
        ]);
        if (homeRes.ok) {
          const homeData = await homeRes.json();
          setHome(mergeHomePage(homeData.homePage));
        }
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const primaryHref = isAuthenticated ? '/dashboard' : home.primaryCtaLink;
  const primaryText = isAuthenticated ? 'Start Testing' : home.primaryCtaText;
  const secondaryHref = isAuthenticated ? '/dashboard' : home.secondaryCtaLink;
  const showSecondary = !isAuthenticated && home.secondaryCtaText;

  const enabledPromos = [...home.promoSections]
    .filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order);

  const enabledFeatures = home.features.filter((f) => f.enabled);

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      {/* Hero */}
      <section
        className={`relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          />
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-purple-600' : 'bg-purple-300'
            }`}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className={`flex flex-col gap-10 items-center ${
              home.showHeroImage && home.heroImage
                ? 'lg:flex-row lg:text-left lg:items-center'
                : 'text-center'
            }`}
          >
            <div className={home.showHeroImage && home.heroImage ? 'flex-1' : 'w-full'}>
              {home.tagline && (
                <p
                  className={`text-sm sm:text-base font-semibold tracking-wide uppercase mb-4 ${
                    isDark ? 'text-blue-300' : 'text-blue-600'
                  }`}
                >
                  {home.tagline}
                </p>
              )}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 leading-tight">
                {home.title}
              </h1>
              <p
                className={`text-lg sm:text-xl max-w-3xl mb-8 leading-relaxed ${
                  home.showHeroImage && home.heroImage ? '' : 'mx-auto'
                } ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {home.description}
              </p>
              <div
                className={`flex flex-col sm:flex-row gap-4 ${
                  home.showHeroImage && home.heroImage ? '' : 'justify-center'
                }`}
              >
                <Link
                  href={primaryHref}
                  className={`px-8 sm:px-10 py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                  }`}
                >
                  {primaryText} <FiArrowRight className="w-5 h-5" />
                </Link>
                {showSecondary && (
                  <Link
                    href={secondaryHref}
                    className={`px-8 sm:px-10 py-4 rounded-lg font-bold text-lg text-center transition ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                    }`}
                  >
                    {home.secondaryCtaText} 
                  </Link>
                )}
              </div>
            </div>

            {home.showHeroImage && home.heroImage && (
              <div className="flex-1 w-full max-w-xl">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={home.heroImage}
                    alt={home.heroImageAlt || home.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      {home.showStats && home.stats.length > 0 && (
        <section className={`py-12 px-4 ${isDark ? 'bg-gray-900 border-y border-gray-800' : 'bg-white border-y border-gray-100'}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {home.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <HomePageIcon
                  name={stat.icon}
                  className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}
                />
                <p className="text-2xl sm:text-3xl font-black text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {enabledFeatures.length > 0 && (
        <section className={`py-16 sm:py-20 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{home.featuresTitle}</h2>
              {home.featuresSubtitle && (
                <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {home.featuresSubtitle}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {enabledFeatures.map((feature, i) => (
                <div
                  key={i}
                  className={`p-6 sm:p-8 rounded-xl border-2 hover:shadow-lg transition ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 ${
                      isDark ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}
                  >
                    <HomePageIcon name={feature.icon} className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional blocks */}
      {enabledPromos.map((promo, index) => (
        <section
          key={index}
          className={`py-16 sm:py-20 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${
            index % 2 === 0
              ? isDark
                ? 'bg-gray-950'
                : 'bg-gray-50'
              : isDark
              ? 'bg-gray-900'
              : 'bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div
              className={`flex flex-col gap-10 items-center ${
                promo.image ? 'lg:flex-row' : ''
              } ${promo.imagePosition === 'left' && promo.image ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 w-full">
                {promo.subtitle && (
                  <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {promo.subtitle}
                  </p>
                )}
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">{promo.title}</h2>
                <p className={`text-base sm:text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {promo.description}
                </p>
                {promo.buttonText && promo.buttonLink && (
                  <Link
                    href={promo.buttonLink}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {promo.buttonText} <FiArrowRight />
                  </Link>
                )}
              </div>
              {promo.image && (
                <div className="flex-1 w-full">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* About */}
      {home.aboutContent && (
        <section className={`py-16 sm:py-20 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">{home.aboutTitle}</h2>
            <p className={`text-lg leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {home.aboutContent}
            </p>
          </div>
        </section>
      )}

      {/* Courses */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{home.coursesTitle}</h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{home.coursesSubtitle}</p>
            </div>
            {user?.role === 'admin' && (
              <Link
                href="/admin/courses"
                className={`px-6 py-3 rounded-lg font-semibold text-center whitespace-nowrap ${
                  isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                + Add Course
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div
              className={`text-center py-16 rounded-lg border-2 border-dashed ${
                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-100'
              }`}
            >
              <FiBook className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-xl font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No courses available yet
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {courses.map((course) => (
                <Link key={course._id} href={`/course/${course._id}`}>
                  <div
                    className={`group h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden">
                      {course.image ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/20" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <FiBook className="w-14 h-14 text-white mb-2" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-500 transition">
                        {course.name}
                      </h3>
                      <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.description}
                      </p>
                      <span className="text-blue-500 font-semibold flex items-center gap-2">
                        View Course <FiArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900'
            : 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">{home.ctaTitle}</h2>
          <p className="text-lg sm:text-xl text-gray-100 mb-10 leading-relaxed">{home.ctaDescription}</p>
          {!isAuthenticated && home.ctaButtonText && (
            <Link
              href={home.ctaButtonLink}
              className="inline-block px-8 sm:px-10 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              {home.ctaButtonText}
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="inline-block px-8 sm:px-10 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
