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
}

interface QuestionSet {
  _id: string;
  course: Course;
  name: string;
  description: string;
  createdBy: any;
}

/**
 * Admin Question Sets Management Page
 * Create, read, update, and delete question sets
 */
export default function AdminQuestionSetsPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course: '',
    name: '',
    description: '',
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch question sets and courses
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch question sets
        const setsRes = await fetch('/api/question-sets');
        if (setsRes.ok) {
          const setsData = await setsRes.json();
          setQuestionSets(setsData.questionSets);
        }

        // Fetch courses
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router]);

  /**
   * Handle form input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.course || !formData.name) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingSet ? `/api/question-sets/${editingSet._id}` : '/api/question-sets';
      const method = editingSet ? 'PUT' : 'POST';

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
        throw new Error(error.error || 'Failed to save question set');
      }

      const data = await res.json();
      toast.success(editingSet ? 'Question set updated!' : 'Question set created!');

      // Refresh question sets
      if (editingSet) {
        setQuestionSets(questionSets.map((qs) => (qs._id === editingSet._id ? data.questionSet : qs)));
      } else {
        setQuestionSets([...questionSets, data.questionSet]);
      }

      closeForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete question set
   */
  const handleDelete = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this question set?')) return;

    try {
      const res = await fetch(`/api/question-sets/${setId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete question set');
      }

      setQuestionSets(questionSets.filter((qs) => qs._id !== setId));
      toast.success('Question set deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  /**
   * Start editing a question set
   */
  const startEdit = (questionSet: QuestionSet) => {
    setEditingSet(questionSet);
    setFormData({
      course: questionSet.course._id,
      name: questionSet.name,
      description: questionSet.description,
    });
    setShowForm(true);
  };

  /**
   * Close form
   */
  const closeForm = () => {
    setShowForm(false);
    setEditingSet(null);
    setFormData({ course: '', name: '', description: '' });
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
            <h1 className="text-3xl font-bold">Manage Question Sets</h1>
          </div>
          <button
            onClick={() => {
              setEditingSet(null);
              setFormData({ course: '', name: '', description: '' });
              setShowForm(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <FiPlus /> Add Question Set
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
                  {editingSet ? 'Edit Question Set' : 'Create Question Set'}
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
                  <label className="block text-sm font-semibold mb-2">Select Course *</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Question Set Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Set-1, Mock Test-1"
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
                    placeholder="Optional description..."
                    rows={3}
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
                  {isSubmitting ? 'Saving...' : editingSet ? 'Update Set' : 'Create Set'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Question Sets List */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {isLoading ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading question sets...</p>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No question sets created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Course</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Set Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionSets.map((set) => (
                    <tr
                      key={set._id}
                      className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-sm">{set.course.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{set.name}</td>
                      <td className="px-6 py-4 text-sm truncate">{set.description || '-'}</td>
                      <td className="px-6 py-4 text-sm flex gap-3">
                        <button
                          onClick={() => startEdit(set)}
                          className="text-blue-500 hover:text-blue-600 transition"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(set._id)}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
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
