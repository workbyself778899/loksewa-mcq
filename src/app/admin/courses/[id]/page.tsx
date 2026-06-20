'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface QuestionSet {
  _id: string;
  name: string;
  description: string;
  course: string;
  questions: string[];
  questionCount?: number;
  createdBy: any;
}

interface Course {
  _id: string;
  name: string;
}

/**
 * Admin Question Sets Management Page for a specific course
 */
export default function AdminQuestionSetsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Check admin access and fetch data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData.course);
        }

        // Fetch question sets for this course
        const setsRes = await fetch(`/api/question-sets?courseId=${courseId}`);
        if (setsRes.ok) {
          const setsData = await setsRes.json();
          setQuestionSets(setsData.questionSets);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router, courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingSet ? `/api/question-sets/${editingSet._id}` : '/api/question-sets';
      const method = editingSet ? 'PUT' : 'POST';

      const body = editingSet
        ? { name: formData.name, description: formData.description }
        : { name: formData.name, description: formData.description, course: courseId };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save question set');
      }

      const data = await res.json();
      toast.success(editingSet ? 'Question set updated!' : 'Question set created!');

      if (editingSet) {
        setQuestionSets(questionSets.map((s) => (s._id === editingSet._id ? data.questionSet : s)));
      } else {
        setQuestionSets([...questionSets, data.questionSet]);
      }

      setShowForm(false);
      setFormData({ name: '', description: '' });
      setEditingSet(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      setQuestionSets(questionSets.filter((s) => s._id !== setId));
      toast.success('Question set deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (set: QuestionSet) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      description: set.description,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSet(null);
    setFormData({ name: '', description: '' });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} flex ${isDark ? 'text-white' : 'text-gray-600'} items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} py-8 ${isDark ? 'text-white' : 'text-gray-600'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin/courses" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4">
              <FiArrowLeft /> Back to Courses
            </Link>
            <h1 className="text-3xl font-bold">Question Sets for {course?.name}</h1>
          </div>
          <button
            onClick={() => {
              setEditingSet(null);
              setFormData({ name: '', description: '' });
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
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Set Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Set 1, Set 2"
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
                    placeholder="Description for this set..."
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
          {questionSets.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No question sets for this course yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Questions</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionSets.map((set) => (
                    <tr key={set._id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-6 py-4 font-semibold">{set.name}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                        {set.description}
                      </td>
                      <td className="px-6 py-4 text-center">{set.questionCount || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(set)}
                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/admin/question-sets/${set._id}`}
                            className="p-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition"
                          >
                            <FiPlus className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(set._id)}
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
