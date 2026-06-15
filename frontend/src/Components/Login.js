import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer/Footer"; 
import Header from "./Header/Header"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/users/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user._id);

      setMessage("Login successful ✅");

      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/profile");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <>
      <Header />

      <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "0 20px", color: "#fff", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%", maxWidth: "1400px" }}>
          <div style={{ backgroundImage: `url('/images/login11.jpg')`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "50%", height: "90vh", display: "flex", alignItems: "center" }} />

          <div style={{ maxWidth: "400px", width: "100%", padding: "40px", background: "rgba(0, 0, 0, 0.7)", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "translateX(5%) skewX(-5deg)", marginLeft: "30px" }}>
            <h1 style={{ fontSize: "2.8em", marginBottom: "30px", lineHeight: "1.1", fontWeight: "bold", textAlign: "left", transform: "skewX(5deg)" }}>
              Hello, <br /> Welcome Back!
            </h1>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px", transform: "skewX(5deg)" }}>
              <div>
                <label style={{ display: "block", textAlign: "left", fontSize: "0.9em", color: "#ccc", marginBottom: "5px" }}>Username</label>
                <input placeholder="User123" value={username} onChange={(e) => setUsername(e.target.value)} required
                  style={{ padding: "12px", fontSize: "1em", border: "2px solid #fff", borderRadius: "5px", background: "transparent", color: "#fff", outline: "none", width: "100%", transition: "border-color 0.3s" }}
                  onFocus={(e) => e.target.style.borderColor = "#4CAF50"} onBlur={(e) => e.target.style.borderColor = "#fff"} />
              </div>

              <div>
                <label style={{ display: "block", textAlign: "left", fontSize: "0.9em", color: "#ccc", marginBottom: "5px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: "12px", fontSize: "1em", border: "2px solid #fff", borderRadius: "5px", background: "transparent", color: "#fff", outline: "none", width: "100%", transition: "border-color 0.3s" }}
                    onFocus={(e) => e.target.style.borderColor = "#4CAF50"} onBlur={(e) => e.target.style.borderColor = "#fff"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: "1.2em" }}>
                    {showPassword ? " " : "👁"}
                  </button>
                </div>
              </div>

              <p style={{ textAlign: "right", marginTop: "-10px", fontSize: "0.9em", color: "#ccc", transform: "skewX(5deg)" }}>
                <Link to="/forgot-password" style={{ color: "#ccc", textDecoration: "none" }}>Forgot password?</Link>
              </p>

              <button
  type="submit"
  style={{
    padding: "12px",
    fontSize: "1.1em",
    backgroundColor: "#4CAF50 !important",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.3s",
    transform: "skewX(5deg)",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
>
  Login
</button>

            </form>

            <p style={{ marginTop: "15px", color: "#ccc", textAlign: "center" }}>{message}</p>
            <p style={{ marginTop: "20px", color: "#ccc", textAlign: "center", fontSize: "0.9em", transform: "skewX(5deg)" }}>
              Don’t have an account? <Link to="/register" style={{ color: "#4CAF50", textDecoration: "none" }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
