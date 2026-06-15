import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import "./QandAUpdate.css";

const URL = "http://localhost:5000/QandA";

function QandAUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    question: "",
    answer: "",
    category: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Q&A data safely
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URL}/${id}`);
        const data = res.data.QandA || {};
        setInputs({
          question: data.question || "",
          answer: data.answer || "",
          category: data.category || ""
        });
      } catch (err) {
        console.error("Failed to load Q&A:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Validation logic (safe and robust)
  const getFieldError = (name, value, isSubmit = false) => {
    const stringValue = value !== undefined && value !== null ? String(value) : "";
    const trimmedValue = stringValue.trim();

    if (isSubmit && !trimmedValue) {
      switch (name) {
        case "question":
          return "Question is required";
        case "answer":
          return "Answer is required";
        case "category":
          return "Category is required";
        default:
          return "";
      }
    }

    if (!trimmedValue) return "";

    let error = "";
    switch (name) {
      case "question":
        if (trimmedValue.length < 10) {
          error = "Question must be at least 10 characters long";
        } else if (trimmedValue.length > 300) {
          error = "Question cannot exceed 300 characters";
        }
        break;
      case "answer":
        if (trimmedValue.length < 5) {
          error = "Answer must be at least 5 characters long";
        } else if (trimmedValue.length > 1000) {
          error = "Answer cannot exceed 1000 characters";
        }
        break;
      case "category":
        if (!trimmedValue) {
          error = "Please select a category";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // ✅ Handle input change (real-time validation)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, false);
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // ✅ Validate on blur (focus out)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, true);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // ✅ Check all validations before enabling button
  const computeValidity = () => {
    return (
      inputs.question.trim().length >= 10 &&
      inputs.answer.trim().length >= 5 &&
      inputs.category.trim() !== "" &&
      Object.values(errors).every((err) => err === "")
    );
  };

  // ✅ Handle submit (update Q&A)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitErrors = {};
    Object.entries(inputs).forEach(([name, value]) => {
      const err = getFieldError(name, value, true);
      if (err) submitErrors[name] = err;
    });

    if (Object.keys(submitErrors).length > 0) {
      setErrors(submitErrors);
      return;
    }

    try {
      await axios.put(`${URL}/${id}`, inputs);
      navigate("/admin/qaforum");
    } catch (err) {
      console.error("Error updating Q&A:", err);
      setErrors({ global: "Failed to update Q&A. Please try again." });
    }
  };

  // ✅ Loading state
  if (loading) {
    return <div className="loading">Loading Q&A...</div>;
  }

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Q&A Update</title>
      </Helmet>

      <div className="update-container">
        <h2>Update Q&A</h2>

        <form className="update-form" onSubmit={handleSubmit}>
          {/* Question */}
          <label>Question:</label>
          <input
            name="question"
            value={inputs.question}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Update question"
            className={errors.question ? "border-error" : ""}
          />
          {errors.question && <p className="error-text">{errors.question}</p>}

          {/* Answer */}
          <label>Answer:</label>
          <textarea
            name="answer"
            value={inputs.answer}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Update answer"
            rows={4}
            className={errors.answer ? "border-error" : ""}
          />
          {errors.answer && <p className="error-text">{errors.answer}</p>}

          {/* Category */}
          <label>Category:</label>
          <select
            name="category"
            value={inputs.category}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.category ? "border-error" : ""}
          >
            <option value="">-- Select a Category --</option>
            <option value="SoilHealth">Soil Health</option>
            <option value="WaterManagement">Water Management</option>
            <option value="OrganicFarming">Organic Farming</option>
            <option value="ClimateChange">Climate Change</option>
            <option value="Sustainability">Sustainability</option>
          </select>
          {errors.category && <p className="error-text">{errors.category}</p>}

          {errors.global && <p className="error-text">{errors.global}</p>}

          <button
            className="update-btn"
            type="submit"
            disabled={!computeValidity()}
          >
            Update
          </button>
        </form>
      </div>
    </>
  );
}

export default QandAUpdate;
