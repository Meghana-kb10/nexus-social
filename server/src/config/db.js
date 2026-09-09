import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Connect to MongoDB using Mongoose.
 * Reads MONGO_URI from environment variables.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.warn('⚠️  MongoDB URI (MONGO_URI) is not configured in .env.');
    console.warn('ℹ️  Please set MONGO_URI in server/.env with your MongoDB Atlas or local connection string.');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      // Keep every environment on the shared application database even when
      // MONGO_URI omits a database path.
      dbName: 'mini_social_db'
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
};
