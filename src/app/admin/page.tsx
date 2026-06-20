'use client';

// Prevent static prerendering for this dynamic admin page
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { FiBook, FiSettings, FiLogOut, FiFileText, FiHelpCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
  createdBy: any;
}

/**
 * Admin Dashboard
 * Central hub for admin management functions
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch courses
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated, user, router]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 ${isDark ? 'text-white' : 'text-gray-600'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gradient-to-r from-green-900 to-emerald-900' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-100 mt-2">Manage courses, questions, and content</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Courses */}
          <Link href="/admin/courses">
            <div
              className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <FiBook className="w-12 h-12 text-blue-500" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Manage Courses</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Add, edit, or delete courses
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Question Sets */}
          <Link href="/admin/question-sets">
            <div
              className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <FiFileText className="w-12 h-12 text-green-500" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Question Sets</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create and manage question sets
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/admin/home-editor">
            <div
              className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <FiSettings className="w-12 h-12 text-purple-500" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Home Page Builder</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Hero, promos, stats, features & CTAs
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Courses Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Courses</h2>
          {isLoading ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
          ) : courses.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No courses created yet</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <Link key={course._id} href={`/admin/courses/${course._id}`}>
                  <div
                    className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <div className="p-4">
                      <h3 className="font-bold mb-1 line-clamp-1">{course.name}</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {course.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
