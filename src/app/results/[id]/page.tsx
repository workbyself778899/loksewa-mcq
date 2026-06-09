'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import TestAnswerReview from '@/components/TestAnswerReview';
import type { TestReviewItem } from '@/lib/buildTestReview';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ResultSummary {
  _id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  completedAt: string;
  questionSet: { _id: string; name: string };
}

/**
 * Past test review page — lets users see correct answers for a completed attempt.
 */
export default function ResultReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const { token, isAuthenticated } = useAuth();

  const resultId = params.id as string;

  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const [review, setReview] = useState<TestReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchReview = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/test-results/${resultId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load review');
        }

        const data = await response.json();
        setSummary(data.result);
        setReview(data.review);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load review';
        toast.error(message);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchReview();
    }
  }, [resultId, isAuthenticated, token, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? 'bg-gray-950' : 'bg-gray-50'
        }`}
      >
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading answer review...</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        isDark ? 'bg-gray-950' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div
          className={`rounded-lg shadow-lg p-6 mb-8 ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Answer Review</h1>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {summary.questionSet.name}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-semibold text-green-500">
              Score: {summary.score}/{summary.totalMarks} ({summary.percentage.toFixed(2)}%)
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Correct: {summary.correctAnswers} · Wrong: {summary.wrongAnswers}
            </span>
            <span
              className={`flex items-center gap-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <FiClock />
              {formatTime(summary.timeSpent)}
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              {new Date(summary.completedAt).toLocaleString()}
            </span>
          </div>
        </div>

        <TestAnswerReview review={review} isDark={isDark} />
      </div>
    </div>
  );
}
