/**
 * Builds answer-review payload after a test is submitted or when viewing a past result.
 * Maps each question to the user's choice, correct option, and whether they were right.
 */
export interface TestReviewItem {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number;
  isCorrect: boolean;
}

export function buildTestReview(
  questions: Array<{
    _id: { toString(): string } | string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>,
  answers: number[]
): TestReviewItem[] {
  return questions.map((question, index) => {
    const userAnswer = answers[index] ?? -1;
    return {
      _id: String(question._id),
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      userAnswer,
      isCorrect: userAnswer === question.correctAnswer,
    };
  });
}
