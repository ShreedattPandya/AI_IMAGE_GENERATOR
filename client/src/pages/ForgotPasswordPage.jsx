import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Password reset via email is not available yet.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", textAlign: "center", marginTop: "1rem" }}>
          This feature is coming soon. In the meantime, please contact support if you need access to your account.
        </p>
        <div className="auth-footer" style={{ marginTop: "2rem" }}>
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
