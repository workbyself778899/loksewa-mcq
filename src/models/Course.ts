import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the Course interface for TypeScript type safety
export interface ICourse extends Document {
  name: string;
  description: string;
  image: string; // URL to course image
  createdBy: Types.ObjectId; // User ID of admin who created it
  createdAt: Date;
  updatedAt: Date;
}

// Define the Course schema
const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a course name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a course image'],
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
const Course =
  mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
