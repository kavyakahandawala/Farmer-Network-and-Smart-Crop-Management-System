import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || form.rating === 0) {
      alert("⚠️ Please fill all fields and select a rating!");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setForm({ name: "", email: "", rating: 0, message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "90vh",
          backgroundImage: "url('/images/feedback.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Poppins', sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "550px",
            backgroundColor: "rgba(123, 163, 121, 0.9)", // semi-transparent to show bg
            borderRadius: "18px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
            padding: "40px 35px",
            textAlign: "center",
            backdropFilter: "blur(4px)",
            transform: animate ? "translateY(0)" : "translateY(50px)",
            opacity: animate ? 1 : 0,
            transition: "all 0.8s ease",
          }}
        >
          <h2
            style={{
              color: "#0d3d0fff",
              marginBottom: "10px",
              fontWeight: "700",
              fontSize: "1.8rem",
            }}
          >
            🌿 We Value Your Feedback
          </h2>
          <p style={{ color: "#353333ff", marginBottom: "30px" }}>
            Tell us how we can make <strong>AgroSphere</strong> better for you!
          </p>

          {submitted ? (
            <div
              style={{
                backgroundColor: "#E8F5E9",
                color: "#2e7d32",
                padding: "15px",
                borderRadius: "10px",
                fontWeight: "500",
                fontSize: "1rem",
              }}
            >
              ✅ Thank you for your valuable feedback!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
              />

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "#144317ff",
                    fontWeight: "600",
                  }}
                >
                  Rate Your Experience
                </label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleRating(star)}
                      style={{
                        cursor: "pointer",
                        fontSize: "1.8rem",
                        color: star <= form.rating ? "#fbc02d" : "#ccc",
                        transition: "color 0.2s",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                name="message"
                placeholder="Write your feedback..."
                value={form.message}
                onChange={handleChange}
                style={{ ...inputStyle, height: "120px", resize: "none" }}
              />

              <button
                type="submit"
                style={submitBtn}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#2e7d32")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#43a047")
                }
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: "12px 15px",
  borderRadius: "10px",
  border: "2px solid #c8e6c9",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.2s ease",
};

const submitBtn = {
  backgroundColor: "#43a047",
  color: "#fff",
  padding: "12px 25px",
  border: "none",
  borderRadius: "10px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  width: "fit-content",
  alignSelf: "center",
  transition: "background 0.3s",
};

export default FeedbackForm;
