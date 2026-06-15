import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./QandACreate.css";

const URL = "http://localhost:5000/QandA";

function QandACreate() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    question: "",
    answer: "",
    category: "",
  });
  const [errors, setErrors] = useState({});

  // ✅ Validation logic per field
  const getFieldError = (name, value, isSubmit = false) => {
    const trimmedValue = value.trim();
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

  // ✅ When user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, false);
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // ✅ When field loses focus
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = getFieldError(name, value, true);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // ✅ Overall validity
  const computeValidity = () => {
    return (
      inputs.question.trim().length >= 10 &&
      inputs.answer.trim().length >= 5 &&
      inputs.category.trim() !== "" &&
      Object.values(errors).every((err) => err === "")
    );
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all validations
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
      await axios.post(URL, inputs);
      navigate("/admin/qaforum");
    } catch (err) {
      console.error("Error creating Q&A:", err);
      setErrors({ global: "Failed to create Q&A. Please try again." });
    }
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Q&A Create</title>
      </Helmet>

      <div className="create-container">
        <h2>Create Q&A</h2>

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Question */}
          <label>Question:</label>
          <input
            name="question"
            value={inputs.question}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your question"
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
            placeholder="Enter your answer"
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

          <button type="submit" disabled={!computeValidity()}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default QandACreate;
