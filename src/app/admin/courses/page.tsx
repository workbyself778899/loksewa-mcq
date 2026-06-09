'use client';

// Prevent static prerendering for this dynamic admin page
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
  createdBy: any;
}

/**
 * Admin Courses Management Page
 * Create, read, update, and delete courses
 */
export default function AdminCoursesPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

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

  /**
   * Handle form input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.image) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save course');
      }

      const data = await res.json();
      toast.success(editingCourse ? 'Course updated!' : 'Course created!');

      // Refresh courses
      if (editingCourse) {
        setCourses(courses.map((c) => (c._id === editingCourse._id ? data.course : c)));
      } else {
        setCourses([...courses, data.course]);
      }

      setShowForm(false);
      setFormData({ name: '', description: '', image: '' });
      setEditingCourse(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete course
   */
  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete course');
      }

      setCourses(courses.filter((c) => c._id !== courseId));
      toast.success('Course deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  /**
   * Start editing a course
   */
  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      image: course.image,
    });
    setShowForm(true);
  };

  /**
   * Close form
   */
  const closeForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({ name: '', description: '', image: '' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 ${isDark ? 'text-white' : 'text-gray-600'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4">
              <FiArrowLeft /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold">Manage Courses</h1>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              setFormData({ name: '', description: '', image: '' });
              setShowForm(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <FiPlus /> Add Course
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingCourse ? 'Edit Course' : 'Create Course'}
                </h2>
                <button
                  onClick={closeForm}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition`}
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Course Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Operator"
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Course description..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {isLoading ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No courses created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-6 py-4 font-semibold">{course.name}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                        {course.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(course)}
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/admin/courses/${course._id}`}
                            className="p-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition"
                          >
                            <FiPlus className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
