import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./QandAPost.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const URL = "http://localhost:5000/post";

function QandAPost() {
  const [form, setForm] = useState({
    creatorName: "",
    creatorEmail: "",
    creatorPhone: "",
    creatorQuestion: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const navigate = useNavigate();

  const getFieldError = (name, value, isSubmit = false) => {
    const trimmedValue = value.trim();
    if (isSubmit && !trimmedValue) {
      switch (name) {
        case 'creatorName': return "Full name is required";
        case 'creatorEmail': return "Email is required";
        case 'creatorPhone': return "Phone number is required";
        case 'creatorQuestion': return "Question is required";
        default: return '';
      }
    }
    if (!trimmedValue) {
      return '';
    }

    let error = '';
    switch (name) {
      case 'creatorName':
        if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
          error = "Full name can only contain letters and spaces";
        } else if (trimmedValue.length > 100) {
          error = "Full name must be less than 100 characters";
        }
        break;
      case 'creatorEmail':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        } else if (value.length > 100) {
          error = "Email must be less than 100 characters";
        }
        break;
      case 'creatorPhone':
        if (!/^\d*$/.test(value)) {
          error = "Phone number can only contain digits";
        } else if (value.length > 10) {
          error = "Phone number must be 10 digits or less";
        } else if (value.length > 0 && !value.startsWith('0')) {
          error = "Phone number must start with 0";
        }
        break;
      case 'creatorQuestion':
        if (value.length > 500) {
          error = "Question cannot exceed 500 characters";
        }
        break;
      default:
        break;
    }

    if ((isSubmit || name === 'creatorName' || name === 'creatorPhone' || name === 'creatorQuestion') && error === '') {
      switch (name) {
        case 'creatorName':
          if (trimmedValue.split(' ').filter(Boolean).length < 2) {
            error = "Please enter a full name (e.g., Amila Perera)";
          } else if (trimmedValue.length < 5) {
            error = "Full name must be at least 5 characters";
          }
          break;
        case 'creatorPhone':
          const cleanPhone = value.replace(/\s/g, '');
          if (cleanPhone.length !== 10 || !/^0\d{9}$/.test(cleanPhone)) {
            error = "Please enter a valid Sri Lankan phone number (e.g., 0771234567)";
          }
          break;
        case 'creatorQuestion':
          if (trimmedValue.length < 10) {
            error = "Question must be at least 10 characters";
          }
          break;
        default:
          break;
      }
    }
    return error;
  };

  const computeValidity = () => {
    let isValid = true;

    // Check required fields
    if (!form.creatorName.trim()) isValid = false;
    if (!form.creatorEmail.trim()) isValid = false;
    if (!form.creatorPhone.trim()) isValid = false;
    if (!form.creatorQuestion.trim()) isValid = false;
    if (form.creatorQuestion.length > 500) isValid = false;
    if (imageError) isValid = false;

    // Check formats
    const nameParts = form.creatorName.trim().split(' ').filter(Boolean);
    if (nameParts.length < 2 || !/^[A-Za-z\s]+$/.test(form.creatorName.trim())) isValid = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.creatorEmail)) isValid = false;

    const phoneClean = form.creatorPhone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) isValid = false;

    // Min length for question
    if (form.creatorQuestion.trim().length < 10) isValid = false;

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, false);
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, true);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError("Please select a valid image file (JPEG, PNG, etc.).");
        e.target.value = "";
        setImagePreview("");
        setForm((prev) => ({ ...prev, image: "" }));
        return;
      }
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
      setForm((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitErrors = {};
    Object.entries(form).forEach(([name, value]) => {
      if (name !== 'image') {
        const fieldError = getFieldError(name, value, true);
        if (fieldError) submitErrors[name] = fieldError;
      }
    });
    if (Object.keys(submitErrors).length > 0 || imageError) {
      setErrors(submitErrors);
      return;
    }
    try {
      await axios.post(URL, form);
      navigate("/posts");
    } catch (error) {
      console.error("Error posting question:", error);
    }
  };

  return (
    <div className="qanda-post-page page-layout">
    <div className="page-layout">
      <Header />

      <div className="main_content">
        <div className="post_container">
          {/* Left side image */}
          <div className="post_image">
            <img src="/images/d5.webp" alt="Ask Question" />
          </div>

          {/* Right side form */}
          <div className="post_form">
            <h2>Ask a Question</h2>
            <form onSubmit={handleSubmit}>
              <label>Your Name</label>
              <input
                type="text"
                name="creatorName"
                value={form.creatorName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Amila Perera"
                className={errors.creatorName ? 'border-error' : ''}
              />
              {errors.creatorName && <span className="error">{errors.creatorName}</span>}

              <label>Your Email</label>
              <input
                type="email"
                name="creatorEmail"
                value={form.creatorEmail}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.creatorEmail ? 'border-error' : ''}
              />
              {errors.creatorEmail && <span className="error">{errors.creatorEmail}</span>}

              <label>Your Phone Number</label>
              <input
                type="tel"
                name="creatorPhone"
                value={form.creatorPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 0771234567"
                maxLength={10}
                className={errors.creatorPhone ? 'border-error' : ''}
              />
              {errors.creatorPhone && <span className="error">{errors.creatorPhone}</span>}

              <label>Your Question</label>
              <textarea
                name="creatorQuestion"
                value={form.creatorQuestion}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={500}
                placeholder="Enter your question here..."
                className={errors.creatorQuestion ? 'border-error' : ''}
              />
              <div className="char-counter">
                {form.creatorQuestion.length}/500
              </div>
              {errors.creatorQuestion && <span className="error">{errors.creatorQuestion}</span>}

              <label>Attach Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {imageError && <span className="error">{imageError}</span>}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={!computeValidity()}>
                Post Question
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </div>
  );
}

export default QandAPost;