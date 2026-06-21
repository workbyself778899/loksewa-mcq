'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiFileText, FiPlayCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface QuestionSet {
  _id: string;
  name: string;
  description?: string;
  course: string;
}

/**
 * Course detail page component
 * Displays all question sets available for a specific course
 * Users can start taking tests from here
 */
export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const { token, isAuthenticated } = useAuth();

  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch course details and question sets
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch course details
        const courseRes = await fetch(`/api/courses`);
        if (courseRes.ok) {
          const coursesData = await courseRes.json();
          const foundCourse = coursesData.courses.find((c: Course) => c._id === courseId);
          setCourse(foundCourse);
        }

        // Fetch question sets for this course
        const setsRes = await fetch(`/api/question-sets?courseId=${courseId}`);
        if (setsRes.ok) {
          const setsData = await setsRes.json();
          setQuestionSets(setsData.questionSets);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, isAuthenticated, router]);

  return (
    <div className={`min-h-screen ${isDark ? 'text-white' : 'text-gray-600'} ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6 font-semibold"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {isLoading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading course...</p>
        ) : !course ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Course not found</p>
        ) : (
          <>
            {/* Course Header */}
            <div className={`rounded-lg overflow-hidden shadow-lg mb-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                {course.image ? (
                  <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                ) : (
                  <FiFileText className="w-24 h-24 text-white opacity-50" />
                )}
              </div>
              <div className={`p-8 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h1 className="text-4xl font-bold mb-3">{course.name}</h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{course.description}</p>
              </div>
            </div>

            {/* Question Sets */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">Available Question Sets</h2>

                {/* Sort Filter */}
                {questionSets.length > 0 && (
                  <div className="flex items-center gap-3">
                    <FiClock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sort by:</span>
                    <div className={`flex rounded-lg overflow-hidden border ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <button
                        onClick={() => setSortOrder('latest')}
                        className={`px-4 py-1.5 text-sm font-medium transition ${
                          sortOrder === 'latest'
                            ? isDark
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Latest
                      </button>
                      <button
                        onClick={() => setSortOrder('oldest')}
                        className={`px-4 py-1.5 text-sm font-medium transition border-l ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        } ${
                          sortOrder === 'oldest'
                            ? isDark
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Oldest First
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {questionSets.length === 0 ? (
                <div className={`p-12 rounded-lg text-center border-2 border-dashed ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
                  <FiFileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No question sets available yet
                  </p>
                  <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                    Check back soon for more practice tests
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...questionSets]
                    .sort((a, b) => {
                      const timeA = parseInt(a._id.substring(0, 8), 16);
                      const timeB = parseInt(b._id.substring(0, 8), 16);
                      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
                    })
                    .map((set) => (
                    <Link key={set._id} href={`/test/${set._id}`}>
                      <div
                        className={`group rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                          isDark
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-blue-900 hover:to-purple-900'
                            : 'bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-purple-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                              Question Set
                            </div>
                            <h3 className="text-xl font-bold group-hover:text-blue-500 transition">{set.name}</h3>
                          </div>
                          <FiPlayCircle className="w-6 h-6 text-blue-500 ml-2 group-hover:scale-110 transition-transform" />
                        </div>
                        {set.description && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6 line-clamp-2`}>
                            {set.description}
                          </p>
                        )}
                        <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 group-hover:shadow-lg">
                          <FiPlayCircle className="w-5 h-5" />
                          Start Test
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
