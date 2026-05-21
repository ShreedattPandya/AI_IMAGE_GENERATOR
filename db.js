import mongoose from "mongoose";

// Cache the connection promise so serverless warm invocations reuse it
let connectionPromise = null;

const connectDB = async () => {
  // Already connected — nothing to do
  if (mongoose.connection.readyState === 1) return;

  // Connection in progress — wait for it
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      connectionPromise = null; // allow retry on next request
      throw err;
    });

  return connectionPromise;
};

export default connectDB;
