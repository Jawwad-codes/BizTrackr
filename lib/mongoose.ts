/** @format */

import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to prevent multiple connections in development
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB via Mongoose");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connection status checker for Mongoose
export async function checkMongooseConnection(): Promise<boolean> {
  try {
    const connection = await connectToDatabase();
    return connection.connection.readyState === 1; // 1 = connected
  } catch (error) {
    console.error("Mongoose connection failed:", error);
    return false;
  }
}

// Graceful shutdown for Mongoose
export async function closeMongooseConnection(): Promise<void> {
  try {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log("Mongoose connection closed");
  } catch (error) {
    console.error("Error closing Mongoose connection:", error);
  }
}

export default connectToDatabase;
