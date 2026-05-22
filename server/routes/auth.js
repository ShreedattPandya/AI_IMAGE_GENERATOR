import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
  };
}

// POST /api/auth/signup — creates account and logs in immediately (no email verification)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      emailVerified: true, // no email verification step
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err);
    res.status(500).json({ error: err.message || "Signup failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    res.status(500).json({ error: err.message || "Login failed." });
  }
});

// POST /api/auth/forgot-password — email service not available yet
router.post("/forgot-password", async (_req, res) => {
  res.status(503).json({
    error: "Password reset via email is not available yet. Please contact support.",
  });
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: userResponse(req.user),
  });
});

export default router;
