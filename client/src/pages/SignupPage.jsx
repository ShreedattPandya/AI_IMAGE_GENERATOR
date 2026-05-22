import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupUser, verifyEmail, resendOtp } from "../api";

export default function SignupPage() {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const navigate = useNavigate();
  const { setSession } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setError("");
    setLoading(true);

    try {
      const data = await signupUser(name, email, password, confirmPassword);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyEmail(email, otp);
      setSession(data);
      navigate("/create", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    try {
      const data = await resendOtp(email);
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        {step === "form" ? (
          <>
            <h2>Join Gem AI</h2>
            <p className="auth-subtitle">Create your account to start generating</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSignup}>
              <label htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
              />

              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />

              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                minLength={6}
              />

              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                minLength={6}
              />

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <span className="spinner small" /> : "Continue"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </>
        ) : (
          <>
            <h2>Verify your email</h2>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>

            {devOtp && (
              <div className="dev-notice">
                Dev mode (Supabase not configured): <strong>{devOtp}</strong>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleVerify}>
              <label htmlFor="verify-otp" className="sr-only">
                Verification code
              </label>
              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                placeholder="000000"
                maxLength={6}
                className="otp-input"
              />

              <button type="submit" className="btn-primary auth-submit" disabled={loading || otp.length < 6}>
                {loading ? <span className="spinner small" /> : "Verify & Continue"}
              </button>
            </form>

            <button
              type="button"
              className="btn-resend-otp"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? "Sending…" : "Resend code"}
            </button>

            <div className="auth-footer">
              <button type="button" className="link-btn" onClick={() => setStep("form")}>
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
