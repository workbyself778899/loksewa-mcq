'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiAlertCircle, FiCheckCircle, FiClock, FiArrowLeft, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import TestAnswerReview from '@/components/TestAnswerReview';
import type { TestReviewItem } from '@/lib/buildTestReview';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
}

interface QuestionSet {
  _id: string;
  name: string;
  course: { name: string };
}

/**
 * Test/Quiz page component
 * Displays MCQ questions and allows users to take the test
 * Tracks answers and time spent
 * Fully responsive design with dark mode support
 */
export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const { token, isAuthenticated } = useAuth();

  const questionSetId = params.id as string;

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [review, setReview] = useState<TestReviewItem[]>([]);
  const [testResultId, setTestResultId] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch questions for this question set
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);

        // Fetch question set details
        const setsRes = await fetch(`/api/question-sets`);
        if (setsRes.ok) {
          const setsData = await setsRes.json();
          const foundSet = setsData.questionSets.find((s: QuestionSet) => s._id === questionSetId);
          setQuestionSet(foundSet);
        }

        // Fetch questions (correct answers are hidden until after submit)
        const questionsRes = await fetch(`/api/questions?questionSetId=${questionSetId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData.questions);
          // Initialize answers array with -1 (unanswered)
          setAnswers(new Array(questionsData.questions.length).fill(-1));
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load test questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [questionSetId, isAuthenticated, router, token]);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  /**
   * Format time in MM:SS format
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Submit the test
   */
  const handleSubmit = async () => {
    try {
      // Check if all questions are answered
      if (answers.includes(-1)) {
        toast.error('Please answer all questions before submitting');
        return;
      }

      setIsSubmitting(true);

      // Submit test results
      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionSetId,
          answers,
          timeSpent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit test');
      }

      const data = await response.json();
      setResults(data.result);
      setReview(data.review || []);
      setTestResultId(data.result._id || null);
      setShowResults(true);
      setShowReview(false);
      toast.success('Test submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center  justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-gray-200' : 'text-gray-600'}>Loading test...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-gray-200' : 'text-gray-600'}>No questions available for this test</p>
      </div>
    );
  }

  // Answer review view (shown after test is submitted)
  if (showResults && showReview && review.length > 0) {
    return (
      <div className={`min-h-screen py-8 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-lg shadow-lg p-6 mb-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Review Your Answers</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {questionSet?.name} — see correct options and explanations below
            </p>
          </div>

          <TestAnswerReview review={review} isDark={isDark} />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => setShowReview(false)}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Back to Score
            </button>
            <Link
              href="/dashboard"
              className={`px-8 py-3 rounded-lg font-semibold text-center transition ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Results summary view
  if (showResults && results) {
    const percentageValue = parseFloat(results.percentage);
    const passed = percentageValue >= 50;
    const totalMarks = results.totalMarks;
    const obtainedMarks = parseFloat(results.score);

    return (
      <div className={`min-h-screen py-8 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          {/* Results Card */}
          <div className={`rounded-lg shadow-lg p-8 text-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Score Icon */}
            <div className="mb-6">
              {passed ? (
                <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              ) : (
                <FiAlertCircle className="w-20 h-20 text-red-500 mx-auto" />
              )}
            </div>

            {/* Score Display */}
            <h1 className="text-4xl font-bold mb-2">
              {obtainedMarks}/{totalMarks}
            </h1>
            <p className={`text-2xl font-bold mb-6 ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {percentageValue.toFixed(2)}%
            </p>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
              {passed ? 'Congratulations! You passed the test.' : 'Keep practicing to improve your score.'}
            </p>

            {/* Detailed Score Breakdown */}
            <div className={`grid grid-cols-2 gap-4 mb-8 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct Answers</p>
                <p className="text-2xl font-bold text-green-500">{results.correctAnswers}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wrong Answers</p>
                <p className="text-2xl font-bold text-red-500">{results.wrongAnswers}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unanswered</p>
                <p className="text-2xl font-bold text-yellow-500">{results.unanswered}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Marks per Question</p>
                <p className="text-2xl font-bold text-blue-500">{results.marksPerQuestion}</p>
              </div>
            </div>

            {/* Score Calculation Details */}
            {results.negativeMarks > 0 && (
              <div className={`mb-8 p-4 rounded-lg text-left ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Score Calculation:</p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  ({results.correctAnswers} × {results.marksPerQuestion}) - ({results.wrongAnswers} × {results.negativeMarks}) = {obtainedMarks.toFixed(2)}
                </p>
              </div>
            )}

            {/* Time */}
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
              <FiClock />
              <span>Time spent: {formatTime(timeSpent)}</span>
            </div>

            {/* Buttons — review answers or return to dashboard */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {review.length > 0 && (
                <button
                  onClick={() => setShowReview(true)}
                  className={`px-8 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <FiEye /> Review Answers
                </button>
              )}
              {testResultId && (
                <Link
                  href={`/results/${testResultId}`}
                  className={`px-8 py-3 rounded-lg font-semibold text-center transition ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Open Full Review
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`px-8 py-3 rounded-lg font-semibold text-center transition ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test view
  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`rounded-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mb-2">
                <FiArrowLeft /> Back
              </Link>
              <h1 className="text-2xl font-bold">{questionSet?.name}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{questions.length} Questions</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <FiClock />
              <span className="font-semibold">{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{
                  width: `${((answers.filter((a) => a !== -1).length / answers.length) * 100).toFixed(0)}%`,
                }}
              ></div>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Answered: {answers.filter((a) => a !== -1).length}/{answers.length}
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={question._id} className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              {/* Question */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold flex-shrink-0 ${
                    answers[index] !== -1
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-lg font-semibold">{question.questionText}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 ml-12">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(index, optionIndex)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      answers[index] === optionIndex
                        ? isDark
                          ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                          : 'border-blue-500 bg-blue-50'
                        : isDark
                        ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[index] === optionIndex
                            ? 'border-blue-500 bg-blue-500'
                            : isDark
                            ? 'border-gray-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {answers[index] === optionIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answers.includes(-1)}
            className={`px-12 py-4 rounded-lg font-bold text-lg transition ${
              isDark
                ? `${answers.includes(-1) ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`
                : `${answers.includes(-1) ? 'bg-gray-300 opacity-50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>

        {answers.includes(-1) && (
          <p className={`text-center mt-4 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            Please answer all questions before submitting
          </p>
        )}
      </div>
    </div>
  );
}
