'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiEye,
  FiFlag,
  FiEdit3,
  FiX,
  FiLayout,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
  FiFileText
} from 'react-icons/fi';
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

  // Notes and Interactivity State
  const [notes, setNotes] = useState<string[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showNotesInputs, setShowNotesInputs] = useState<boolean[]>([]);

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
          // Initialize answers and helper states
          setAnswers(new Array(questionsData.questions.length).fill(-1));
          setNotes(new Array(questionsData.questions.length).fill(''));
          setFlagged(new Array(questionsData.questions.length).fill(false));
          setShowNotesInputs(new Array(questionsData.questions.length).fill(false));
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
  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const executeSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmSubmit(false);

      // Submit test results with notes and general notes
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
          notes,
          generalNotes,
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

          {generalNotes && (
            <div className={`rounded-lg shadow-lg p-6 mb-8 border ${
              isDark
                ? 'bg-yellow-950/20 border-yellow-800/40 text-yellow-100'
                : 'bg-yellow-50 border-yellow-200 text-yellow-900'
            }`}>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <FiFileText className="text-yellow-500" /> General Test Notes / Scratchpad
              </h2>
              <p className="whitespace-pre-wrap text-sm">{generalNotes}</p>
            </div>
          )}

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

            {/* General notes scratchpad display if filled */}
            {generalNotes && (
              <div className={`mb-8 p-6 rounded-lg text-left border ${
                isDark ? 'bg-gray-800 border-gray-750' : 'bg-gray-100 border-gray-200'
              }`}>
                <h3 className="text-md font-bold mb-2 flex items-center gap-2">
                  <FiFileText className="text-yellow-500" /> Your General Notes / Scratchpad:
                </h3>
                <p className={`whitespace-pre-wrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {generalNotes}
                </p>
              </div>
            )}

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

  // Helper to render a question card
  const renderQuestionCard = (question: Question, index: number) => {
    return (
      <div
        key={question._id}
        id={`question-card-${index}`}
        className={`rounded-xl p-6 shadow-md transition-all duration-200 border ${
          isDark
            ? 'bg-gray-900 border-gray-800 text-white'
            : 'bg-white border-gray-200 text-gray-850'
        }`}
      >
        {/* Question Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold flex-shrink-0 transition-colors duration-200 ${
              flagged[index]
                ? 'bg-amber-500 text-white border-amber-600'
                : answers[index] !== -1
                ? 'bg-emerald-500 text-white border-emerald-600'
                : isDark
                ? 'bg-gray-800 text-gray-400 border border-gray-700'
                : 'bg-gray-150 text-gray-600 border border-gray-250'
            }`}
          >
            {index + 1}
          </div>
          <p className="text-lg font-semibold leading-relaxed">{question.questionText}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 ml-12">
          {question.options.map((option, optionIndex) => {
            const isSelected = answers[index] === optionIndex;
            return (
              <button
                key={optionIndex}
                onClick={() => handleAnswerSelect(index, optionIndex)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-205 ${
                  isSelected
                    ? isDark
                      ? 'border-blue-500 bg-blue-950/20 text-white'
                      : 'border-blue-500 bg-blue-50/80 text-blue-900'
                    : isDark
                    ? 'border-gray-800 bg-gray-900/40 text-gray-300 hover:border-gray-700 hover:bg-gray-800/40'
                    : 'border-gray-200 bg-gray-50/40 text-gray-700 hover:border-gray-300 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : isDark
                        ? 'border-gray-700'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 ml-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newFlagged = [...flagged];
                newFlagged[index] = !newFlagged[index];
                setFlagged(newFlagged);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
                flagged[index]
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400'
                  : isDark
                  ? 'border-gray-800 text-gray-400 hover:text-gray-350 hover:bg-gray-800'
                  : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-55'
              }`}
            >
              <FiFlag className={flagged[index] ? 'fill-current' : ''} />
              {flagged[index] ? 'Flagged' : 'Flag for Review'}
            </button>

            <button
              onClick={() => {
                const newShowNotes = [...showNotesInputs];
                newShowNotes[index] = !newShowNotes[index];
                setShowNotesInputs(newShowNotes);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
                notes[index]
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                  : isDark
                  ? 'border-gray-800 text-gray-400 hover:text-gray-350 hover:bg-gray-800'
                  : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-55'
              }`}
            >
              <FiEdit3 />
              {notes[index] ? 'Edit Note' : 'Add Note'}
            </button>
          </div>

          {answers[index] !== -1 && (
            <button
              onClick={() => handleAnswerSelect(index, -1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors border border-transparent"
            >
              <FiX className="w-3.5 h-3.5" /> Clear Selection
            </button>
          )}
        </div>

        {/* Note input area */}
        {showNotesInputs[index] && (
          <div className="mt-4 ml-12">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Question Note
            </label>
            <textarea
              value={notes[index] || ''}
              onChange={(e) => {
                const newNotes = [...notes];
                newNotes[index] = e.target.value;
                setNotes(newNotes);
              }}
              placeholder="Jot down notes, formulas, or reminders for this question..."
              rows={2}
              className={`w-full p-3 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y ${
                isDark
                  ? 'bg-gray-950 border-gray-800 text-white focus:border-blue-650'
                  : 'bg-white border-gray-200 text-gray-850 focus:border-blue-500'
              }`}
            />
          </div>
        )}
      </div>
    );
  };

  // Test view
  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 ${isDark ? 'text-white' : 'text-gray-600'} lg:px-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mb-2">
                <FiArrowLeft /> Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold">{questionSet?.name}</h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{questions.length} Questions</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${isDark ? 'bg-gray-850 text-white' : 'bg-blue-50 text-blue-800'}`}>
              <FiClock className="w-5 h-5 text-blue-500" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-850' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                style={{
                  width: `${((answers.filter((a) => a !== -1).length / answers.length) * 100).toFixed(0)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                Progress: {((answers.filter((a) => a !== -1).length / answers.length) * 100).toFixed(0)}%
              </span>
              <span className="font-bold">
                Answered: {answers.filter((a) => a !== -1).length} of {answers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Focus toggle and submit button */}
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-4 mb-6 rounded-xl border shadow-sm ${
          isDark ? 'bg-gray-900/60 border-gray-850' : 'bg-white border-gray-150'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              View Mode:
            </span>
            <div className="flex rounded-lg overflow-hidden border border-gray-350 dark:border-gray-800 p-0.5 bg-gray-100 dark:bg-gray-950">
              <button
                onClick={() => setIsFocusMode(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  isFocusMode
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <FiLayout className="w-3.5 h-3.5" /> Focus Mode (1 Qn)
              </button>
              <button
                onClick={() => setIsFocusMode(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  !isFocusMode
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <FiMaximize2 className="w-3.5 h-3.5" /> Scroll Mode (All)
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-8 py-2.5 rounded-lg font-bold text-sm text-white transition shadow-md ${
              isDark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            Submit Test
          </button>
        </div>

        {/* Collapsible Mobile Panel for Navigation & Scratchpad */}
        <div className="block lg:hidden mb-6">
          <details className={`rounded-xl border shadow-md overflow-hidden ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <summary className="p-4 font-bold text-sm cursor-pointer flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <FiLayout /> Quick Dashboard (Scratchpad & Nav)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-105 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                Tap to Expand
              </span>
            </summary>
            <div className="p-4 border-t border-gray-100 dark:border-gray-805 space-y-4">
              {/* Question Grid */}
              <div>
                <h4 className="text-xs font-bold mb-2 uppercase tracking-wide text-gray-400">Jump to Question:</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, qIdx) => {
                    const isAnswered = answers[qIdx] !== -1;
                    const isFlagged = flagged[qIdx];
                    const isActive = isFocusMode && qIdx === currentQuestionIndex;
                    
                    let btnClass = '';
                    if (isActive) btnClass = 'ring-2 ring-blue-500 border-blue-500 font-bold';
                    if (isFlagged) {
                      btnClass += ' bg-amber-500 border-amber-600 text-white';
                    } else if (isAnswered) {
                      btnClass += ' bg-emerald-500 border-emerald-600 text-white';
                    } else {
                      btnClass += isDark
                        ? ' bg-gray-950 border-gray-800 text-gray-300'
                        : ' bg-gray-50 border-gray-200 text-gray-700';
                    }
                    
                    return (
                      <button
                        key={question._id}
                        onClick={() => {
                          if (isFocusMode) {
                            setCurrentQuestionIndex(qIdx);
                          } else {
                            const el = document.getElementById(`question-card-${qIdx}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className={`h-9 rounded-lg text-xs font-semibold border flex items-center justify-center transition-colors ${btnClass}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Scratchpad */}
              <div>
                <h4 className="text-xs font-bold mb-2 uppercase tracking-wide text-gray-400">Mobile Scratchpad:</h4>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Notes for calculation or review..."
                  rows={3}
                  className={`w-full p-2.5 text-xs rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none ${
                    isDark
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
          </details>
        </div>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {isFocusMode ? (
              <div>
                {renderQuestionCard(questions[currentQuestionIndex], currentQuestionIndex)}
                
                {/* Navigation Controls in Focus Mode */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition border ${
                      currentQuestionIndex === 0
                        ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-850 text-gray-400'
                        : isDark
                        ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-800'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    <FiChevronLeft className="w-5 h-5" /> Previous
                  </button>

                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-450' : 'text-gray-550'}`}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>

                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition border ${
                      currentQuestionIndex === questions.length - 1
                        ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-855 text-gray-400'
                        : isDark
                        ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-800'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    Next <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => renderQuestionCard(question, index))}
              </div>
            )}
            
            {/* Submit Button at Bottom for scroll mode */}
            {!isFocusMode && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  className={`px-12 py-4 rounded-xl font-bold text-lg text-white transition shadow-md ${
                    isDark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar for Desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Question Navigation */}
              <div className={`p-6 rounded-xl border shadow-md ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <FiLayout className="text-blue-500" /> Question Navigation
                </h3>
                
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                  {questions.map((question, qIdx) => {
                    const isAnswered = answers[qIdx] !== -1;
                    const isFlagged = flagged[qIdx];
                    const isActive = isFocusMode && qIdx === currentQuestionIndex;
                    
                    let btnClass = '';
                    if (isActive) btnClass = 'ring-2 ring-blue-500 border-blue-500 font-bold';
                    if (isFlagged) {
                      btnClass += ' bg-amber-500 border-amber-600 hover:bg-amber-600 text-white';
                    } else if (isAnswered) {
                      btnClass += ' bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white';
                    } else {
                      btnClass += isDark
                        ? ' bg-gray-950 border-gray-800 hover:bg-gray-800 text-gray-300'
                        : ' bg-gray-55 border-gray-200 hover:bg-gray-100 text-gray-700';
                    }
                    
                    return (
                      <button
                        key={question._id}
                        onClick={() => {
                          if (isFocusMode) {
                            setCurrentQuestionIndex(qIdx);
                          } else {
                            const el = document.getElementById(`question-card-${qIdx}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className={`h-10 rounded-lg text-xs font-semibold border flex items-center justify-center transition shadow-sm ${btnClass}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-805 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block"></span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600 inline-block"></span>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border inline-block ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'}`}></span>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>

              {/* General Scratchpad */}
              <div className={`p-6 rounded-xl border shadow-md ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <FiFileText className="text-yellow-500" /> Scratchpad / Notes
                </h3>
                <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Use this workspace for notes, calculations, or reminders. Notes are saved along with your attempt.
                </p>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Draft formulas, quick translations, or exam notes here..."
                  rows={6}
                  className={`w-full p-3 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none ${
                    isDark
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:border-blue-650'
                      : 'bg-white border-gray-250 text-gray-800 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Overlay Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition duration-200 border ${
            isDark ? 'bg-gray-905 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-blue-500 w-6 h-6 animate-bounce" /> Submit Test?
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to finish and submit your test? Here is a summary of your attempt:
            </p>

            {/* Stats breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                <div className="text-2xl font-bold">{answers.filter(a => a !== -1).length}</div>
                <div className="text-xs font-semibold">Answered</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-950/20 text-amber-400 border border-amber-900/40' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                <div className="text-2xl font-bold">{flagged.filter(f => f).length}</div>
                <div className="text-xs font-semibold">Flagged</div>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-red-950/20 text-red-400 border border-red-900/40' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <div className="text-2xl font-bold">{answers.filter(a => a === -1).length}</div>
                <div className="text-xs font-semibold">Unanswered</div>
              </div>
            </div>

            {answers.includes(-1) && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
                isDark ? 'bg-amber-950/25 border-amber-900/40 text-amber-300' : 'bg-amber-55 border-amber-200 text-amber-800'
              }`}>
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="text-sm leading-relaxed">
                  <span className="font-bold">Warning:</span> You have {answers.filter(a => a === -1).length} unanswered questions. Unanswered questions will receive 0 marks (no negative marks).
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${
                  isDark
                    ? 'border-gray-800 hover:bg-gray-800 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Go Back
              </button>
              <button
                onClick={executeSubmit}
                disabled={isSubmitting}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors shadow-md ${
                  isDark
                    ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-850'
                    : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
