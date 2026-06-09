'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionSet: string;
  createdBy: any;
}

interface QuestionSet {
  _id: string;
  name: string;
  description: string;
  course: string | { _id: string };
  
}

/**
 * Admin Questions Management Page for a specific question set
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const questionSetId = params.id as string;
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
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

        // Fetch question set details
        const setRes = await fetch(`/api/question-sets/${questionSetId}`);
        if (setRes.ok) {
          const setData = await setRes.json();
          setQuestionSet(setData.questionSet);
        }

        // Fetch questions for this set (admin token required for correct answers)
        const questionsRes = await fetch(`/api/questions?questionSetId=${questionSetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router, questionSetId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'correctAnswer' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingQuestion ? `/api/questions/${editingQuestion._id}` : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const body = {
        question: formData.question,
        options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
        correctAnswer: formData.correctAnswer,
        ...(editingQuestion ? {} : { questionSet: questionSetId }),
      };

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
        throw new Error(error.error || 'Failed to save question');
      }

      const data = await res.json();
      toast.success(editingQuestion ? 'Question updated!' : 'Question created!');

      if (editingQuestion) {
        setQuestions(questions.map((q) => (q._id === editingQuestion._id ? data.question : q)));
      } else {
        setQuestions([...questions, data.question]);
      }

      setShowForm(false);
      setFormData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 0,
      });
      setEditingQuestion(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter((q) => q._id !== questionId));
      toast.success('Question deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      optionA: question.options[0],
      optionB: question.options[1],
      optionC: question.options[2],
      optionD: question.options[3],
      correctAnswer: question.correctAnswer,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 0,
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
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
            <Link href={`/admin/courses/${typeof questionSet?.course === 'string' ? questionSet.course : questionSet?.course?._id}`} className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4">
              <FiArrowLeft /> Back to Question Sets
            </Link>
            <h1 className="text-3xl font-bold">Questions for {questionSet?.name}</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{questionSet?.description}</p>
          </div>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({
                question: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                correctAnswer: 0,
              });
              setShowForm(true);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <FiPlus /> Add Question
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Question</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter your MCQ question..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold mb-2">Option {label}</label>
                      <input
                        type="text"
                        name={`option${label}`}
                        value={formData[`option${label}` as keyof typeof formData] as string}
                        onChange={handleInputChange}
                        placeholder={`Option ${label}`}
                        className={`w-full px-4 py-2 rounded-lg border transition ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                            : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                        } outline-none`}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Correct Answer</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={formData.correctAnswer === index}
                          onChange={handleInputChange}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold">Option {String.fromCharCode(65 + index)}</span>
                      </label>
                    ))}
                  </div>
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
                  {isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div
              className={`rounded-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No questions yet. Add your first question!</p>
            </div>
          ) : (
            questions.map((question, idx) => (
              <div
                key={question._id}
                className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      Question {idx + 1}: {question.question}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(question)}
                      className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Options Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-lg border-2 transition ${
                        optIdx === question.correctAnswer
                          ? isDark
                            ? 'bg-green-900/30 border-green-600'
                            : 'bg-green-50 border-green-500'
                          : isDark
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{option}</span>
                        {optIdx === question.correctAnswer && (
                          <span className="ml-auto text-green-500 font-bold text-xs">✓ Correct</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Total Questions: <span className="text-blue-500">{questions.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
