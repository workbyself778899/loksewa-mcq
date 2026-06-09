'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiBook, FiAward, FiArrowRight, FiLogOut, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface TestResult {
  _id: string;
  questionSet: { _id: string; name: string };
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

/**
 * User Dashboard page
 * Displays user's test results and available courses
 * Shows performance metrics and allows access to take new tests
 */
export default function DashboardPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, token, logout, isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch courses and test results
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch courses
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses);
        }

        // Fetch user's test results
        if (token) {
          const resultsRes = await fetch('/api/test-results', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            setTestResults(resultsData.results);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, router]);

  // Calculate statistics
  const totalTests = testResults.length;
  const averageScore =
    testResults.length > 0
      ? (testResults.reduce((sum, result) => sum + result.percentage, 0) / testResults.length).toFixed(2)
      : 0;
  const bestScore = testResults.length > 0 ? Math.max(...testResults.map((r) => r.percentage)) : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'text-white' : 'text-gray-600'} ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome, {user?.fullName}!</h1>
              <p className="text-gray-100">Track your progress and take tests</p>
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

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Tests */}
          <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tests Completed</p>
                <p className="text-3xl font-bold text-blue-500 mt-2">{totalTests}</p>
              </div>
              <FiBook className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Average Score */}
          <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
                <p className="text-3xl font-bold text-purple-500 mt-2">{averageScore}%</p>
              </div>
              <FiAward className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          {/* Best Score */}
          <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Best Score</p>
                <p className="text-3xl font-bold text-green-500 mt-2">{bestScore}%</p>
              </div>
              <FiAward className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
            {isLoading ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No courses available</p>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Link key={course._id} href={`/course/${course._id}`}>
                    <div
                      className={`p-6 rounded-lg hover:shadow-lg my-2 transition cursor-pointer ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-3`}>
                            {course.description}
                          </p>
                          <button className="text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2">
                            View Questions <FiArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                        <FiBook className="w-8 h-8 text-blue-500 opacity-20 ml-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Tests</h2>
            {isLoading ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
            ) : testResults.length === 0 ? (
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No tests completed yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.slice(0, 10).map((result) => (
                  <div
                    key={result._id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold flex-1">{result.questionSet.name}</h4>
                      <span
                        className={`text-sm font-bold px-2 py-1 rounded ${
                          result.percentage >= 70
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                            : result.percentage >= 50
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                        }`}
                      >
                        {result.percentage}%
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {result.score}/{result.totalQuestions} Questions
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/results/${result._id}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-purple-500 hover:text-purple-600"
                    >
                      <FiEye className="w-4 h-4" /> Review Answers
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
