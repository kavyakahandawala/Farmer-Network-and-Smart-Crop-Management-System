import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import "./QandAPostDisplay.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const URL = "http://localhost:5000/post";

function QandAPostDisplay() {
  const [posts, setPosts] = useState([]);
  const [replyForm, setReplyForm] = useState({});
  const [errors, setErrors] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const bannerImages = ["/images/d9.jpg", "/images/img6.webp", "/images/d10.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(URL);
      setPosts(response.data.post);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Scroll fade-in effect
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Validation logic
  const validateField = (name, value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    let error = "";

    if (!trimmed) {
      if (name === "responderName") return "Name is required.";
      if (name === "responderEmail") return "Email is required.";
      if (name === "responderAnswer") return "Reply cannot be empty.";
    }

    switch (name) {
      case "responderName":
        if (!/^[A-Za-z\s]+$/.test(trimmed)) error = "Name can only contain letters and spaces.";
        else if (trimmed.length < 3) error = "Name must be at least 3 characters.";
        break;
      case "responderEmail":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) error = "Please enter a valid email address.";
        break;
      case "responderAnswer":
        if (trimmed.length < 10) error = "Reply must be at least 10 characters.";
        else if (trimmed.length > 500) error = "Reply cannot exceed 500 characters.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleReplyChange = (e, postId) => {
    const { name, value } = e.target;
    setReplyForm({
      ...replyForm,
      [postId]: { ...replyForm[postId], [name]: value },
    });

    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [postId]: { ...errors[postId], [name]: fieldError },
    });
  };

  const handleReplySubmit = async (e, postId) => {
    e.preventDefault();
    const replyData = replyForm[postId] || {};
    const fieldErrors = {};

    Object.keys(replyData).forEach((key) => {
      const err = validateField(key, replyData[key]);
      if (err) fieldErrors[key] = err;
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors({ ...errors, [postId]: fieldErrors });
      return;
    }

    try {
      await axios.post(`${URL}/${postId}/reply`, replyData);
      setReplyForm({ ...replyForm, [postId]: {} });
      setErrors({ ...errors, [postId]: {} });
      fetchPosts();
    } catch (err) {
      console.error("Error submitting reply:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${URL}/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Agricultural Q&A Forum</title>
      </Helmet>

      <div className="qanda-page">
        <Header />

        {/* Banner */}
        <div className="banner-slider">
          {bannerImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Banner ${index + 1}`}
              className={currentIndex === index ? "active" : ""}
            />
          ))}

          <div className="banner-text">
            <h1>Welcome to the Q&A Forum</h1>
            <p>Ask questions, get answers, and share knowledge with the community.</p>
            <button onClick={() => navigate("/post/create")}>➕ Ask a Question</button>
          </div>
        </div>

        {/* Posts */}
        <div className="posts-container" ref={sectionRef}>
          {posts.length === 0 ? (
            <p className="empty-text">No questions available.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-actions">
                  <span
                    className="update-icon"
                    onClick={() => navigate(`/post/update/${post._id}`)}
                  >
                    ✏️
                  </span>
                  <span
                    className="delete-icon"
                    onClick={() => handleDelete(post._id)}
                  >
                    🗑️
                  </span>
                </div>

                <h3>{post.creatorQuestion}</h3>
                <p className="author">
                  <strong>Asked by:</strong> {post.creatorName}<br />
                  <strong>Email:</strong> {post.creatorEmail}<br />
                  <strong>Contact:</strong> {post.creatorPhone}
                </p>

                {post.image && (
                  <img src={post.image} alt="Post" className="post-image" />
                )}
                <p className="date">
                  <em>{new Date(post.postCreatedDate).toLocaleString()}</em>
                </p>

                {/* Replies */}
                <div className="replies-section">
                  <h4>Replies</h4>
                  {post.reply.length === 0 ? (
                    <p>No replies yet.</p>
                  ) : (
                    post.reply.map((r, i) => (
                      <div key={i} className="reply-card">
                        <p>{r.responderAnswer}</p>
                        <p className="reply-author">
                          <strong>Reply by:</strong> {r.responderName}<br />
                          <strong>Email:</strong> {r.responderEmail}<br />
                          <em>{new Date(r.respondCreatedDate).toLocaleString()}</em>
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <div className="reply-form">
                  <h4>Reply to this question</h4>
                  <form onSubmit={(e) => handleReplySubmit(e, post._id)}>
                    <input
                      type="text"
                      name="responderName"
                      placeholder="Your Name"
                      value={replyForm[post._id]?.responderName || ""}
                      onChange={(e) => handleReplyChange(e, post._id)}
                      className={errors[post._id]?.responderName ? "border-error" : ""}
                    />
                    {errors[post._id]?.responderName && (
                      <span className="error">{errors[post._id]?.responderName}</span>
                    )}

                    <input
                      type="email"
                      name="responderEmail"
                      placeholder="Your Email"
                      value={replyForm[post._id]?.responderEmail || ""}
                      onChange={(e) => handleReplyChange(e, post._id)}
                      className={errors[post._id]?.responderEmail ? "border-error" : ""}
                    />
                    {errors[post._id]?.responderEmail && (
                      <span className="error">{errors[post._id]?.responderEmail}</span>
                    )}

                    <textarea
                      name="responderAnswer"
                      placeholder="Your Reply"
                      value={replyForm[post._id]?.responderAnswer || ""}
                      onChange={(e) => handleReplyChange(e, post._id)}
                      className={errors[post._id]?.responderAnswer ? "border-error" : ""}
                    />
                    {errors[post._id]?.responderAnswer && (
                      <span className="error">{errors[post._id]?.responderAnswer}</span>
                    )}

                    <button type="submit">Submit Reply</button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default QandAPostDisplay;
