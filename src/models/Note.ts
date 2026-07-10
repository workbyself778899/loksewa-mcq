import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the Note interface for TypeScript type safety
export interface INote extends Document {
  title: string;
  description: string;
  link?: string; // Optional download/external URL
  createdBy: Types.ObjectId; // User ID of admin who created it
  createdAt: Date;
  updatedAt: Date;
}

// Define the Note schema
const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a note description'],
    },
    link: {
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
const Note = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;
