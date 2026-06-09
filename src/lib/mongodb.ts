import mongoose from 'mongoose';
// Import all models to ensure they are registered with Mongoose
import '@/models/User';
import '@/models/Course';
import '@/models/QuestionSet';
import '@/models/Question';
import '@/models/TestResult';
import '@/models/HomePage';

// MongoDB connection string - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aimcq';
const db = process.env.db;

// Global variable to store the cached connection
declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB using Mongoose
 * This function ensures only one connection is maintained
 */
async function connectDB() {
  // If connection already exists, return it
  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn;
  }

  // If connection promise exists, wait for it
  if (global.mongooseConnection.promise) {
    return global.mongooseConnection.promise;
  }

  // Create new connection promise
  global.mongooseConnection.promise = mongoose
    .connect(MONGODB_URI,{
      dbName:db
    })
    .then((mongoose) => {
      console.log('✓ MongoDB connected successfully');
      return mongoose;
    })
    .catch((error) => {
      console.error('✗ MongoDB connection error:', error);
      throw error;
    });

  // Wait for the connection to complete
  global.mongooseConnection.conn = await global.mongooseConnection.promise;
  return global.mongooseConnection.conn;
}

export default connectDB;
