import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the QuestionSet interface for TypeScript type safety
export interface IQuestionSet extends Document {
  course: Types.ObjectId; // Course ID
  name: string; // e.g., "Set-1", "Set-2"
  description?: string;
  marksPerQuestion: number; // Marks for each correct answer (default: 1)
  negativeMarks: number; // Negative marks for wrong answer (default: 0)
  totalMarks?: number; // Total marks = marksPerQuestion * number of questions
  createdBy: Types.ObjectId; // User ID of admin who created it
  createdAt: Date;
  updatedAt: Date;
}

// Define the QuestionSet schema
const questionSetSchema = new Schema<IQuestionSet>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please provide a course ID'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a question set name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 10,
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Check if model already exists (prevent duplicate model error)
const QuestionSet =
  mongoose.models.QuestionSet ||
  mongoose.model<IQuestionSet>('QuestionSet', questionSetSchema);

export default QuestionSet;
