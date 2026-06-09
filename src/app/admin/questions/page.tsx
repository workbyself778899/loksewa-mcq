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

interface QuestionSet {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  questionSet: QuestionSet;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  createdBy: any;
}

/**
 * Admin Questions Management Page
 * Create, read, update, and delete questions
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, token, isAuthenticated } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    questionSet: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '0',
    explanation: '',
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch questions and question sets
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch questions (admin token required to include correct answers)
        const questionsRes = await fetch('/api/questions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions);
        }

        // Fetch question sets
        const setsRes = await fetch('/api/question-sets');
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
  }, [isAuthenticated, user, router, token]);

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

    if (
      !formData.questionSet ||
      !formData.questionText ||
      !formData.option1 ||
      !formData.option2 ||
      !formData.option3 ||
      !formData.option4
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingQuestion ? `/api/questions/${editingQuestion._id}` : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const payload = {
        questionSet: formData.questionSet,
        questionText: formData.questionText,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctAnswer: parseInt(formData.correctAnswer),
        explanation: formData.explanation,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save question');
      }

      const data = await res.json();
      toast.success(editingQuestion ? 'Question updated!' : 'Question created!');

      // Refresh questions
      if (editingQuestion) {
        setQuestions(questions.map((q) => (q._id === editingQuestion._id ? data.question : q)));
      } else {
        setQuestions([...questions, data.question]);
      }

      closeForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete question
   */
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

  /**
   * Start editing a question
   */
  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionSet: question.questionSet._id,
      questionText: question.questionText,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer.toString(),
      explanation: question.explanation,
    });
    setShowForm(true);
  };

  /**
   * Close form
   */
  const closeForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({
      questionSet: '',
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '0',
      explanation: '',
    });
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
            <h1 className="text-3xl font-bold">Manage Questions</h1>
          </div>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({
                questionSet: '',
                questionText: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correctAnswer: '0',
                explanation: '',
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              className={`rounded-lg p-8 w-full max-w-2xl my-8 ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingQuestion ? 'Edit Question' : 'Create Question'}
                </h2>
                <button
                  onClick={closeForm}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition`}
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Question Set *</label>
                  <select
                    name="questionSet"
                    value={formData.questionSet}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  >
                    <option value="">-- Select a question set --</option>
                    {questionSets.map((set) => (
                      <option key={set._id} value={set._id}>
                        {set.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Question Text *</label>
                  <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleInputChange}
                    placeholder="Enter the question..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border transition ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                    } outline-none`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold">Options *</label>
                  {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                    <div key={optionKey} className="flex gap-2 items-start">
                      <span className="px-3 py-2 bg-blue-500 text-white rounded font-semibold text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        name={optionKey}
                        value={formData[optionKey as keyof typeof formData]}
                        onChange={handleInputChange}
                        placeholder={`Option ${index + 1}`}
                        className={`flex-1 px-4 py-2 rounded-lg border transition ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                            : 'bg-gray-50 border-gray-300 focus:border-blue-500'
                        } outline-none`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Correct Answer *</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index.toString()}
                          checked={formData.correctAnswer === index.toString()}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Explanation (Optional)</label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    placeholder="Explain why this is the correct answer..."
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
                  {isSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {isLoading ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No questions created yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {questions.map((question) => (
                <div key={question._id} className={`p-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-blue-500 font-semibold mb-1">{question.questionSet.name}</p>
                      <p className="font-semibold mb-3">{question.questionText}</p>
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`px-3 py-2 rounded ${
                              index === question.correctAnswer
                                ? isDark
                                  ? 'bg-green-900 border-l-4 border-green-500'
                                  : 'bg-green-100 border-l-4 border-green-500'
                                : isDark
                                ? 'bg-gray-700'
                                : 'bg-gray-100'
                            }`}
                          >
                            <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className={`text-sm mt-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className="font-semibold">Explanation:</span> {question.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(question)}
                        className="text-blue-500 hover:text-blue-600 transition"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className="text-red-500 hover:text-red-600 transition"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
