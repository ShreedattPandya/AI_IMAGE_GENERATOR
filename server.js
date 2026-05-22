import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import connectDB, { getMongoUri } from "./db.js";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const clientDist = path.join(__dirname, "client", "dist");

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Health check — no database required (useful on Vercel)
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongoConfigured: Boolean(getMongoUri()),
    supabaseConfigured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ),
  });
});

// Connect MongoDB only for API routes (not static files / SPA)
app.use("/api", async (req, res, next) => {
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

app.use((err, req, res, _next) => {
  if (res.headersSent) return;

  const status = err.code === "MISSING_MONGODB_URI" ? 503 : 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  if (!getMongoUri()) {
    console.warn("⚠ MONGODB_URI is missing — API routes will fail until it is set.");
  }
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

export default app;
