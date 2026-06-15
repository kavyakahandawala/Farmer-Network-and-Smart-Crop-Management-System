import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./QandAPostUpdate.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const URL = "http://localhost:5000/post";

function QandAPostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    creatorName: "",
    creatorEmail: "",
    creatorQuestion: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${URL}/${id}`);
        const post = response.data.post || {};
        setForm({
          creatorName: post.creatorName ?? "",
          creatorEmail: post.creatorEmail ?? "",
          creatorQuestion: post.creatorQuestion ?? "",
          image: post.image ?? "",
        });
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id]);

  const validateField = (name, value) => {
    const val = (value || "").trim();
    let error = "";

    if (!val) {
      if (name === "creatorName") error = "Name is required.";
      if (name === "creatorEmail") error = "Email is required.";
      if (name === "creatorQuestion") error = "Question is required.";
    } else {
      switch (name) {
        case "creatorName":
          if (!/^[A-Za-z\s]+$/.test(val))
            error = "Name can only contain letters and spaces.";
          else if (val.length < 5)
            error = "Name must be at least 5 characters long.";
          break;

        case "creatorEmail":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
            error = "Please enter a valid email address.";
          break;

        case "creatorQuestion":
          if (val.length < 10)
            error = "Question must be at least 10 characters long.";
          else if (val.length > 500)
            error = "Question cannot exceed 500 characters.";
          break;

        default:
          break;
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file (JPG, PNG, etc.)");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result });
    };
    if (file) reader.readAsDataURL(file);
  };

  const isFormValid = () => {
    return (
      !Object.values(errors).some((err) => err) &&
      !imageError &&
      form.creatorName.trim() &&
      form.creatorEmail.trim() &&
      form.creatorQuestion.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || imageError) return;

    try {
      await axios.put(`${URL}/${id}`, form);
      alert("✅ Question updated successfully!");
      navigate("/posts");
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  // ✅ Inline background (just like QandAForm)
  const backgroundStyle = {
    background: `url("/images/d8.jpg") no-repeat center center/cover`,
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Update Question</title>
      </Helmet>

      <div className="page-layout">
        <Header />

        <main className="update-page" style={backgroundStyle}>
          <div className="post-form-container">
            <h2>Update Your Question</h2>

            <form onSubmit={handleSubmit}>
              <label>Your Name</label>
              <input
                type="text"
                name="creatorName"
                value={form.creatorName}
                onChange={handleChange}
                className={errors.creatorName ? "border-error" : ""}
                placeholder="Enter your full name"
              />
              {errors.creatorName && (
                <span className="error">{errors.creatorName}</span>
              )}

              <label>Your Email</label>
              <input
                type="email"
                name="creatorEmail"
                value={form.creatorEmail}
                onChange={handleChange}
                className={errors.creatorEmail ? "border-error" : ""}
                placeholder="Enter your email"
              />
              {errors.creatorEmail && (
                <span className="error">{errors.creatorEmail}</span>
              )}

              <label>Your Question</label>
              <textarea
                name="creatorQuestion"
                value={form.creatorQuestion}
                onChange={handleChange}
                className={errors.creatorQuestion ? "border-error" : ""}
                placeholder="Update your question..."
                maxLength={500}
              />
              <div className="char-counter">
                {form.creatorQuestion.length}/500
              </div>
              {errors.creatorQuestion && (
                <span className="error">{errors.creatorQuestion}</span>
              )}

              <label>Attach Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {imageError && <span className="error">{imageError}</span>}

              {form.image && (
                <div className="image-preview">
                  <img src={form.image} alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={!isFormValid()}>
                Update Question
              </button>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default QandAPostUpdate;
