import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = request token, 2 = reset password
  
  // Step 1 state
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [generatedCode, setGeneratedCode] = useState(""); // Only for dev since no email service
  
  // Step 2 state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setRequestError("");
    setRequestLoading(true);
    
    try {
      const data = await forgotPassword(email);
      if (data.resetCode) {
        setGeneratedCode(data.resetCode); // Displaying on screen because no email provider
      }
      setStep(2);
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    
    try {
      await resetPassword(email, resetCode, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        
        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset code</p>
            
            {requestError && <div className="error-box">{requestError}</div>}
            
            <form onSubmit={handleRequestToken}>
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <button type="submit" className="btn-primary auth-submit" disabled={requestLoading}>
                {requestLoading ? <span className="spinner small" /> : "Send Reset Code"}
              </button>
            </form>
            <div className="auth-footer">
              <Link to="/login">Back to Login</Link>
            </div>
          </>
        )}

        {step === 2 && !success && (
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter the code sent to your email</p>
            
            {generatedCode && (
              <div className="dev-notice">
                Dev mode (no Resend key): <strong>{generatedCode}</strong>
              </div>
            )}
            
            {resetError && <div className="error-box">{resetError}</div>}
            
            <form onSubmit={handleResetPassword}>
              <label htmlFor="reset-code">6-Digit Code</label>
              <input
                id="reset-code"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                placeholder="123456"
                maxLength="6"
              />
              
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                minLength="6"
              />
              
              <button type="submit" className="btn-primary auth-submit" disabled={resetLoading}>
                {resetLoading ? <span className="spinner small" /> : "Update Password"}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="success-state">
            <h3>✅ Password Reset Successful</h3>
            <p>You can now log in with your new password.</p>
            <p className="text-muted small">Redirecting to login...</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
