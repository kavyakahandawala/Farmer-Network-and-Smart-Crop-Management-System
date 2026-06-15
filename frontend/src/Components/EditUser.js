import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    district: "",
    email: "",
    phone: "",
    username: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setFormData(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

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
        newErrors.age = !value
          ? "Age is required!"
          : value < 18
          ? "You must be at least 18 years old!"
          : "";
        break;
      case "gender":
        newErrors.gender = !value ? "Gender is required!" : "";
        break;
      case "district":
        newErrors.district = !value ? "District is required!" : "";
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
        newErrors.email = !value
          ? "Email is required!"
          : !emailRegex.test(value)
          ? "Invalid email format!"
          : "";
        break;
      case "username":
        newErrors.username = !value
          ? "Username is required!"
          : value.length < 6
          ? "Username must be at least 6 characters!"
          : "";
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    const requiredFields = ["fullName", "age", "gender", "district", "email", "phone", "username"];
    let valid = true;
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required!`;
        valid = false;
      }
    });

    if (formData.age < 18) {
      newErrors.age = "You must be at least 18 years old!";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await API.put(`/users/${id}`, formData);
      setMessage("User updated successfully!");
      setMessageColor("green");
      setTimeout(() => navigate("/admin/dashboard"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update user");
      setMessageColor("red");
    }
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{`
        .edit-form-container {
          max-width: 500px;
          width: 100%;
          padding: 30px;
          background: #bedebeff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
        }
        .edit-form-container h2 {
          text-align: center;
          color: #2e7d32;
          margin-bottom: 25px;
          font-weight: 600;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }
        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid #bdbdbd;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .form-group input:focus,
        .form-group select:focus {
          border-color: #4caf50;
          outline: none;
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
        }
        .submit-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background-color: #4caf50;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn:hover {
          background-color: #2e7d32;
          transform: scale(1.02);
        }
        .error-text {
          color: red;
          font-size: 0.9em;
          margin-top: 3px;
        }
      `}</style>

      <div className="edit-form-container">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit}>
          {[
            { name: "fullName", type: "text", label: "Full Name" },
            { name: "age", type: "number", label: "Age" },
            { name: "gender", type: "select", label: "Gender", options: ["Male", "Female", "Other"] },
            { name: "district", type: "text", label: "District" },
            { name: "email", type: "email", label: "Email" },
            { name: "phone", type: "text", label: "Phone" },
            { name: "username", type: "text", label: "Username" },
            { name: "role", type: "select", label: "Role", options: ["farmer", "admin"] },
          ].map((field, idx) => (
            <div className="form-group" key={idx}>
              <label>{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              )}
              {errors[field.name] && <span className="error-text">{errors[field.name]}</span>}
            </div>
          ))}

          <button type="submit" className="submit-btn">Save Changes</button>

          {message && (
            <p style={{ textAlign: "center", marginTop: "10px", color: messageColor, fontWeight: "bold" }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditUser;
