import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface for TypeScript type safety
export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'user' | 'admin'; // user or admin
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', // Default role is user
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving - middleware
userSchema.pre<IUser>('save', async function (next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if model already exists (prevent duplicate model error)
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
