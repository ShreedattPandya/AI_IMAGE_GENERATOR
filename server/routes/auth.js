import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { sendVerificationOtp, sendPasswordResetOtp, verifySupabaseOtp } from "../utils/email.js";

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

// POST /api/auth/signup — creates account & sends verification OTP via Supabase
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
    let user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (user?.emailVerified) {
      return res.status(400).json({ error: "Email already registered." });
    }

    if (user && !user.emailVerified) {
      user.name = name;
      user.password = password;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        emailVerified: false,
      });
    }

    try {
      await sendVerificationOtp(user.email);
    } catch (err) {
      console.error("[SIGNUP EMAIL]", err);
      return res.status(500).json({ error: "Could not send verification email. Try again later." });
    }

    res.status(201).json({
      success: true,
      needsVerification: true,
      email: user.email,
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err);
    res.status(500).json({ error: err.message || "Signup failed." });
  }
});

// POST /api/auth/verify-email — verifies the Supabase OTP
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the OTP with Supabase
    const result = await verifySupabaseOtp(normalizedEmail, otp.trim());
    if (!result.ok) {
      return res.status(400).json({ error: result.error || "Invalid or expired verification code." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error("[VERIFY EMAIL ERROR]", err);
    res.status(500).json({ error: "Verification failed." });
  }
});

// POST /api/auth/resend-otp — resends OTP via Supabase
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, a new code has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified. Please log in." });
    }

    try {
      await sendVerificationOtp(user.email);
    } catch (err) {
      console.error("[RESEND OTP]", err);
      return res.status(500).json({ error: "Could not send email. Try again later." });
    }

    res.json({
      success: true,
      message: "Verification code resent.",
    });
  } catch (err) {
    console.error("[RESEND OTP ERROR]", err);
    res.status(500).json({ error: "Could not resend code." });
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

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
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

// POST /api/auth/forgot-password — sends reset OTP via Supabase
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({
        success: true,
        message: "If an account with that email exists, a reset code has been sent.",
      });
    }

    try {
      await sendPasswordResetOtp(user.email);
    } catch (err) {
      console.error("[FORGOT PASSWORD EMAIL]", err);
    }

    res.json({
      success: true,
      message: "Reset code sent to your email. Use it within 15 minutes.",
    });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/auth/reset-password — verifies Supabase OTP then resets password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, reset code, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the OTP with Supabase
    const result = await verifySupabaseOtp(normalizedEmail, resetCode.trim(), "email");
    if (!result.ok) {
      return res.status(400).json({ error: result.error || "Invalid or expired reset code." });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id);

    res.json({
      success: true,
      message: "Password reset successfully.",
      token,
      user: userResponse(user),
    });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    res.status(500).json({ error: "Password reset failed." });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: userResponse(req.user),
  });
});

export default router;
