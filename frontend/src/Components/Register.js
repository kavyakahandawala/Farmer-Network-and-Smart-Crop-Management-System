import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer/Footer"; 
import Header from "./Header/Header"; 

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    district: "",
  });

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };
    switch (name) {
      case "fullName":
        newErrors.fullName = !value
          ? "Full Name is required!"
          : value.trim().split(" ").length < 2
          ? "Full Name must include first name and surname!"
          : "";
        break;
      case "age":
        newErrors.age = !value ? "Age is required!" : value < 18 ? "You must be at least 18 years old!" : "";
        break;
      case "gender":
        newErrors.gender = !value ? "Gender is required!" : "";
        break;
      case "address":
        newErrors.address = !value ? "Address is required!" : "";
        break;
      case "phone":
        newErrors.phone = !value
          ? "Phone is required!"
          : !/^\d{10}$/.test(value)
          ? "Phone number must be exactly 10 digits!"
          : "";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newErrors.email = !value ? "Email is required!" : !emailRegex.test(value) ? "Invalid email format!" : "";
        break;
      case "username":
        newErrors.username = !value ? "Username is required!" : value.length < 6 ? "Username must be at least 6 characters!" : "";
        break;
      case "password":
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        newErrors.password = !value
          ? "Password is required!"
          : !passwordRegex.test(value)
          ? "Password must be at least 8 characters with uppercase, lowercase, number, and special character!"
          : "";
        newErrors.confirmPassword =
          formData.confirmPassword && value !== formData.confirmPassword
            ? "Passwords do not match!"
            : newErrors.confirmPassword || "";
        break;
      case "confirmPassword":
        newErrors.confirmPassword = !value
          ? "Confirm Password is required!"
          : value !== formData.password
          ? "Passwords do not match!"
          : "";
        break;
      case "district":
        newErrors.district = !value ? "District is required!" : "";
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    const { fullName, age, gender, address, phone, email, username, password, confirmPassword, district } = formData;
    if (!fullName || !age || !gender || !address || !phone || !email || !username || !password || !confirmPassword || !district) {
      setMessage("All fields are required!");
      return false;
    }
    if (age < 18) {
      setMessage("You must be at least 18 years old!");
      return false;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;

      const res = await axios.post("http://localhost:5000/users/register", payload);

      setMessage(res.data.message || "Registered successfully!");
      setMessageColor("green");

      setFormData({
        fullName: "",
        age: "",
        gender: "",
        address: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        district: "",
      });
      setErrors({});
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong. Please try again later.");
      setMessageColor("red");
    }
  };

  return (
    <>
      {/* Header added at top */}
      <Header />

      <div
        style={{
          backgroundColor: "#000",
          minHeight: "100vh",
          display: "flex",
          margin: "40px 0 20px 0", // 40px top, 20px bottom

          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            maxWidth: "1400px",
            gap: "30px",
          }}
        >
          {/* Left Image Section */}
          <div
            style={{
              flex: "1",
              minWidth: "350px",
              backgroundImage: `url('/images/leaves1.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div style={{ background: "rgba(0,0,0,0.5)", padding: "25px", borderRadius: "16px" }}>
              <h1 style={{ fontSize: "2.5em", marginBottom: "10px", color: "#fff" }}>Let's Get Started</h1>
              <p style={{ color: "#ccc" }}>Join our platform to manage your farm efficiently and securely.</p>
            </div>
          </div>

          {/* Right Form Section */}
          <div
            style={{
              flex: "1",
              minWidth: "350px",
              background: "rgba(128,128,128,0.2)",
              borderRadius: "20px",
              padding: "40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "25px",
            }}
          >
            <h2 style={{ gridColumn: "span 2", marginBottom: "20px", color: "#fff" }}>Sign Up</h2>

            {[
              { name: "fullName", placeholder: "Full Name" },
              { name: "age", placeholder: "Age", type: "number" },
              { name: "gender", placeholder: "Gender", type: "select", options: ["Male", "Female", "Other"] },
              { name: "address", placeholder: "Address" },
              { name: "phone", placeholder: "Phone" },
              { name: "email", placeholder: "Email", type: "email" },
              { name: "username", placeholder: "Username" },
              { name: "password", placeholder: "Password", type: "password" },
              { name: "confirmPassword", placeholder: "Confirm Password", type: "password" },
              { name: "district", placeholder: "District" },
            ].map((field, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      border: "1px solid #ccc",
                      backgroundColor: "#fff",
                      color: "#000",
                    }}
                  >
                    <option value="">Select {field.placeholder}</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      border: "1px solid #ccc",
                      backgroundColor: "#fff",
                      color: "#000",
                    }}
                  />
                )}
                {errors[field.name] && (
                  <span style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}>{errors[field.name]}</span>
                )}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              style={{
                gridColumn: "span 2",
                padding: "16px",
                marginTop: "10px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                fontSize: "1.1em",
                cursor: "pointer",
              }}
            >
              Register
            </button>

            {message && (
              <p style={{ gridColumn: "span 2", textAlign: "center", color: messageColor, fontWeight: "bold" }}>
                {message}
              </p>
            )}

            <p style={{ gridColumn: "span 2", textAlign: "center", color: "#ccc", marginTop: "10px" }}>
              Already a member? <Link to="/login" style={{ color: "#4CAF50" }}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Register;
