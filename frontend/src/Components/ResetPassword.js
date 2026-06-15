import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1: Send code with email validation
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ✅ Validate against user email stored in localStorage (from Login.js)
    const profileEmail = localStorage.getItem("userEmail");
    if (profileEmail && email !== profileEmail) {
      setMessage("❌ Email does not match your profile email");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/users/forgot-password", { email });
      setMessage(res.data.message);
      setLoading(false);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Something went wrong");
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Password and Confirm Password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/users/reset-password", {
        email,
        code,
        newPassword,
      });
      setMessage(res.data.message);
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Something went wrong");
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
        }
        .reset-container {
          width: 100%;
          max-width: 420px;
          padding: 25px;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .reset-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 600;
          color: #333;
        }
        .reset-message {
          text-align: center;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 8px;
          border-radius: 6px;
        }
        .reset-message.success {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }
        .reset-message.error {
          color: #721c24;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }
        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .reset-input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .reset-input:focus {
          border-color: #4a90e2;
          outline: none;
          box-shadow: 0 0 5px rgba(74, 144, 226, 0.4);
        }
        .reset-btn {
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #28a745, #218838); /* ✅ Green gradient */
          color: #fff;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .reset-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838, #1e7e34); /* ✅ Darker green on hover */
          transform: translateY(-2px);
        }

        .reset-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .back-login {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
        }
        .login-link {
          color: #4a90e2;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .login-link:hover {
          color: #2c5f94;
          text-decoration: underline;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="reset-container">
          <h2 className="reset-title"> Reset Password</h2>

          {message && (
            <p
              className={`reset-message ${
                message.includes("✅") ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="reset-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="reset-input"
              />
              <button type="submit" disabled={loading} className="reset-btn">
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="reset-form">
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                required
                maxLength={4}
                onChange={(e) => setCode(e.target.value)}
                className="reset-input"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                required
                minLength={6}
                onChange={(e) => setNewPassword(e.target.value)}
                className="reset-input"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                required
                minLength={6}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="reset-input"
              />
              <button type="submit" disabled={loading} className="reset-btn">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="back-login">
            Back to{" "}
            <span onClick={() => navigate("/login")} className="login-link">
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
