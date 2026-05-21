import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const clientDist = path.join(__dirname, "client", "dist");

// Cloudinary config
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Lazy DB connection — safe for both serverless and long-running processes.
// mongoose.connect() is idempotent; calling it when already connected is a no-op.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    next(err);
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", imageRoutes);

// Serve static build in production
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  console.warn(
    "React build not found. Run: npm run build — or npm run dev for development."
  );
}

// Local dev: start the HTTP server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

// Export for Vercel serverless
export default app;
