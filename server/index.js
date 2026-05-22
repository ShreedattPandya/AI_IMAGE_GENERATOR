import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import connectDB, { getMongoUri } from "./db.js";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server/ then repo root (local monorepo dev)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "gem-ai-api",
    mongoConfigured: Boolean(getMongoUri()),
  });
});

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Gem AI API — use /api/health" });
});

app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api", imageRoutes);

app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  const status = err.code === "MISSING_MONGODB_URI" ? 503 : 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

if (!getMongoUri()) {
  console.warn("⚠ MONGODB_URI is missing — set it in your environment variables.");
}

app.listen(PORT, () => {
  console.log(`Gem AI API running on port ${PORT}`);
});

export default app;
