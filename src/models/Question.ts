import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the Question interface for TypeScript type safety
export interface IQuestion extends Document {
  questionSet: Types.ObjectId; // QuestionSet ID
  questionText: string;
  options: string[]; // Array of 4 options
  correctAnswer: number; // Index of correct option (0-3)
  explanation?: string; // Optional explanation for the answer
  createdBy: Types.ObjectId; // User ID of admin who created it
  createdAt: Date;
  updatedAt: Date;
}

// Define the Question schema
const questionSchema = new Schema<IQuestion>(
  {
    questionSet: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionSet',
      required: [true, 'Please provide a question set ID'],
    },
    questionText: {
      type: String,
      required: [true, 'Please provide the question text'],
    },
    options: {
      type: [String],
      required: [true, 'Please provide at least 4 options'],
      validate: {
        validator: function (v: string[]) {
          return v.length === 4; // Ensure exactly 4 options
        },
        message: 'Must have exactly 4 options',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Please specify the correct answer index'],
      enum: [0, 1, 2, 3], // Valid indices for 4 options
    },
    explanation: {
      type: String,
      default: '',
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
const Question =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
