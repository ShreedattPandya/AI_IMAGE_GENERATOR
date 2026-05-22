import mongoose from "mongoose";

let connectionPromise = null;

export function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || "";
}

const connectDB = async () => {
  const uri = getMongoUri();

  if (!uri) {
    const err = new Error(
      "MONGODB_URI is not set. Add it in Render → your service → Environment."
    );
    err.code = "MISSING_MONGODB_URI";
    throw err;
  }

  if (mongoose.connection.readyState === 1) return;

  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(uri)
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
};

export default connectDB;
