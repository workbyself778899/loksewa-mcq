import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the TestResult interface for TypeScript type safety
export interface ITestResult extends Document {
  user: Types.ObjectId; // User ID
  questionSet: Types.ObjectId; // QuestionSet ID
  answers: number[]; // Array of user's selected answer indices
  notes: string[]; // Array of notes for each question
  generalNotes?: string; // General test notes
  score: number; // Score obtained
  totalMarks: number; // Total marks possible
  totalQuestions: number;
  correctAnswers: number; // Number of correct answers
  wrongAnswers: number; // Number of wrong answers
  unanswered: number; // Number of unanswered questions
  marksPerQuestion: number; // Marks for each correct answer
  negativeMarks: number; // Negative marks for wrong answer
  percentage: number; // Percentage score
  timeSpent: number; // Time spent in seconds
  completedAt: Date;
  createdAt: Date;
}

// Define the TestResult schema
const testResultSchema = new Schema<ITestResult>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    questionSet: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionSet',
      required: [true, 'Please provide a question set ID'],
    },
    answers: {
      type: [Number],
      required: [true, 'Please provide user answers'],
    },
    score: {
      type: Number,
      required: [true, 'Please provide the score'],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide total marks'],
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Please provide total questions count'],
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
      min: 0,
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: 0,
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      required: [true, 'Please provide the percentage score'],
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0, // Time spent in seconds
    },
    notes: {
      type: [String],
      default: [],
    },
    generalNotes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries by user and question set
testResultSchema.index({ user: 1, questionSet: 1 });

// Check if model already exists (prevent duplicate model error)
const TestResult =
  mongoose.models.TestResult ||
  mongoose.model<ITestResult>('TestResult', testResultSchema);

export default TestResult;
