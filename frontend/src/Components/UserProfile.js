import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Fetch current user
  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data);
      setForm(res.data);
      if (res.data.email) localStorage.setItem("userEmail", res.data.email);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Save with inline validation
  const handleSave = async () => {
    const errors = {};

    if (!form.fullName?.trim()) errors.fullName = "Full name is required";
    if (!form.username?.trim()) errors.username = "Username is required";
    if (!form.email?.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Invalid email format";
    if (!form.phone?.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      errors.phone = "Phone number must be 10 digits";
    if (!form.district?.trim()) errors.district = "District is required";
    if (!form.address?.trim()) errors.address = "Address is required";
    if (form.age && (isNaN(form.age) || form.age < 10 || form.age > 100))
      errors.age = "Enter a valid age between 10 and 100";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      const res = await API.put("/users/me/update", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data.user);
      setEditing(false);
      setMessage("✅ Profile updated successfully!");
      setError("");
      setFieldErrors({});

      if (res.data.user.email)
        localStorage.setItem("userEmail", res.data.user.email);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to update profile");
    }
  };

  // ✅ Delete profile with confirmation
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to permanently delete your account?"
    );
    if (!confirmDelete) return;

    try {
      await API.delete("/users/me/delete", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("✅ Your account has been deleted successfully.");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      navigate("/register");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to delete account");
    }
  };

  const handleProfilePicChange = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await API.put("/users/me/profile-pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data);
      setMessage("✅ Profile picture updated!");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to upload profile picture");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Do you really want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      navigate("/login");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await API.get("/users/me/pdf", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${user.fullName.replace(" ", "_")}_Profile.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to download PDF");
    }
  };

  if (!user)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading profile...</p>;

  return (
    <>
      <Header />

      <div
        style={{
          background: "linear-gradient(135deg, #9fd1acff, #fed6e3)",
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header Card */}
        <div
          style={{
            background: "white",
            borderRadius: "10px",
            padding: "20px",
            margin: "40px 0 20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ fontSize: "1.5em", margin: 0 }}>Welcome, {user.fullName}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ margin: 0 }}>{new Date().toLocaleDateString()}</p>
            <img
              src="/icons/log-out.png"
              alt="Logout"
              onClick={handleLogout}
              style={{
                width: "30px",
                height: "30px",
                cursor: "pointer",
                borderRadius: "50%",
              }}
              title="Logout"
            />
            <img
              src={user?.profilePicture || "/uploads/default.png"}
              alt="Avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              onError={(e) => { e.target.onerror = null; e.target.src = "/uploads/default.png"; }}
            />
          </div>
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: "white",
            borderRadius: "10px",
            padding: "30px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

          {/* Profile Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative" }}>
              <img
                src={user?.profilePicture || "/uploads/default.png"}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = "/images/default.png"; }}
              />
              <input
                type="file"
                id="profilePicInput"
                style={{ display: "none" }}
                onChange={(e) => handleProfilePicChange(e.target.files[0])}
              />
              <label
                htmlFor="profilePicInput"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "white",
                  borderRadius: "50%",
                  padding: "5px",
                  cursor: "pointer",
                }}
              >
                <img
                  src="/icons/camera1.jpg"
                  alt="Change"
                  style={{ width: "25px", height: "25px" }}
                />
              </label>
            </div>
            <div style={{ marginLeft: "20px" }}>
              <h2 style={{ margin: 0 }}>{user.fullName}</h2>
              <p style={{ color: "#666", margin: 0 }}>{user.email}</p>
            </div>

            {!editing && user.role === "farmer" && (
              <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => navigate(`/lands/${localStorage.getItem("userId")}`)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  View My Lands
                </button>
                <button
                  onClick={() => navigate("/my-lands")}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Add Land
                </button>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  📄 Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              alignItems: "center",
            }}
          >
            {[
              "fullName",
              "username",
              "email",
              "phone",
              "district",
              "address",
              "age",
            ].map((field) => (
              <div
                key={field}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <label
                  style={{
                    fontSize: "0.9em",
                    color: "#666",
                    marginBottom: "5px",
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field] || ""}
                  disabled={!editing}
                  onChange={handleChange}
                  style={{
                    width: "90%",
                    padding: "10px",
                    border: fieldErrors[field]
                      ? "1px solid red"
                      : "1px solid #ddd",
                    borderRadius: "5px",
                    background: "#f9f9f9",
                    color: "#000000ff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {fieldErrors[field] && (
                  <small style={{ color: "red", marginTop: "5px" }}>
                    {fieldErrors[field]}
                  </small>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          {editing ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm(user);
                  setFieldErrors({});
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete Profile
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => navigate("/reset-password")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Change Password
              </button>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default UserProfile;
