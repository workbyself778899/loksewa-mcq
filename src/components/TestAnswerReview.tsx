'use client';

import { FiCheck, FiX } from 'react-icons/fi';
import type { TestReviewItem } from '@/lib/buildTestReview';

interface TestAnswerReviewProps {
  review: TestReviewItem[];
  isDark: boolean;
}

/**
 * Displays each question after a test with the user's answer, correct answer, and explanation.
 * Used on the post-submit screen and on the past-results review page.
 */
export default function TestAnswerReview({ review, isDark }: TestAnswerReviewProps) {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {review.map((item, index) => (
        <div
          key={item._id}
          className={`rounded-lg p-4 sm:p-6 shadow-lg ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Question header with correct / wrong badge */}
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                item.isCorrect
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg font-semibold">{item.questionText}</p>
              <span
                className={`inline-flex items-center gap-1 mt-2 text-sm font-medium px-2 py-1 rounded ${
                  item.isCorrect
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}
              >
                {item.isCorrect ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Correct
                  </>
                ) : (
                  <>
                    <FiX className="w-4 h-4" /> Incorrect
                  </>
                )}
              </span>
            </div>
          </div>

          {/* All options with visual markers for user vs correct choice */}
          <div className="space-y-2 ml-0 sm:ml-11">
            {item.options.map((option, optionIndex) => {
              const isCorrectOption = optionIndex === item.correctAnswer;
              const isUserChoice =
                item.userAnswer !== -1 && optionIndex === item.userAnswer;
              const isWrongUserChoice = isUserChoice && !isCorrectOption;

              let optionClass = isDark
                ? 'border-gray-700 bg-gray-900/50'
                : 'border-gray-200 bg-gray-50';

              if (isCorrectOption) {
                optionClass = isDark
                  ? 'border-green-600 bg-green-900/30'
                  : 'border-green-500 bg-green-50';
              } else if (isWrongUserChoice) {
                optionClass = isDark
                  ? 'border-red-600 bg-red-900/30'
                  : 'border-red-500 bg-red-50';
              }

              return (
                <div
                  key={optionIndex}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 ${optionClass}`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCorrectOption
                        ? 'bg-green-500 text-white'
                        : isWrongUserChoice
                        ? 'bg-red-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {optionLabels[optionIndex]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm sm:text-base">{option}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {isCorrectOption && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          Correct answer
                        </span>
                      )}
                      {isUserChoice && (
                        <span
                          className={`text-xs font-semibold ${
                            isCorrectOption
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          Your answer
                        </span>
                      )}
                    </div>
                  </div>
                  {isCorrectOption && (
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {isWrongUserChoice && (
                    <FiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional explanation from admin */}
          {item.explanation && (
            <div
              className={`mt-4 ml-0 sm:ml-11 p-3 rounded-lg text-sm ${
                isDark ? 'bg-gray-700/80 text-gray-300' : 'bg-blue-50 text-gray-700'
              }`}
            >
              <p className="font-semibold mb-1">Explanation</p>
              <p>{item.explanation}</p>
            </div>
          )}

          {/* Optional User Note */}
          {item.userNote && (
            <div
              className={`mt-3 ml-0 sm:ml-11 p-3 rounded-lg text-sm border ${
                isDark
                  ? 'bg-yellow-950/20 border-yellow-850/40 text-yellow-200'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-850'
              }`}
            >
              <p className="font-semibold mb-1">Your Note for this Question</p>
              <p className="whitespace-pre-wrap">{item.userNote}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
