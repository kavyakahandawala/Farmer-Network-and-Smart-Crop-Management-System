import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Step 1: Send code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!email) {
      setMessage("Enter your registered email ❌");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/users/forgot-password", { email });
      setMessage("✅ Reset code sent! Enter code and new password below.");
      setCodeSent(true);
      setLoading(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong ❌");
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!/^\d{4}$/.test(code)) {
      setMessage("Enter a valid 4-digit code ❌");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters ❌");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/users/reset-password", {
        email,
        code,
        newPassword,
      });
      setMessage("✅ Password updated successfully! You can now log in.");
      setLoading(false);
      setEmail("");
      setCode("");
      setNewPassword("");
      setCodeSent(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid code ❌");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #e0fae9ff, #1e5127ff);
          padding: 20px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .forgot-container {
          width: 100%;
          max-width: 420px;
          padding: 25px;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          text-align: center;
        }
        .forgot-title {
          font-size: 22px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }
        .forgot-message {
          font-size: 14px;
          margin-bottom: 15px;
          padding: 8px;
          border-radius: 6px;
        }
        .forgot-message.success {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }
        .forgot-message.error {
          color: #721c24;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .forgot-input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .forgot-input:focus {
          border-color: #28a745;
          outline: none;
          box-shadow: 0 0 5px rgba(40, 167, 69, 0.4);
        }
        .forgot-btn {
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #28a745, #218838);
          color: #fff;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .forgot-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838, #1e7e34);
          transform: translateY(-2px);
        }
        .forgot-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .back-login {
          margin-top: 20px;
          font-size: 14px;
        }
        .login-link {
          color: #28a745;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .login-link:hover {
          color: #1e7e34;
          text-decoration: underline;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="forgot-container">
          <h2 className="forgot-title">Forgot Password</h2>

          {message && (
            <p className={`forgot-message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </p>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="forgot-form">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="forgot-input"
              />
              <button type="submit" disabled={loading} className="forgot-btn">
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-form">
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="forgot-input"
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="forgot-input"
              />
              <button type="submit" disabled={loading} className="forgot-btn">
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="back-login">
            Back to <Link to="/login" className="login-link">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
