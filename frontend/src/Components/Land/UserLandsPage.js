import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { getMyLands, deleteLand, updateLand } from "./landService";
import AddLandForm from "./AddLandForm";

function UserLandsPage() {
  const [lands, setLands] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLand, setEditingLand] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  // Slider images
  const sliderImages = ["/images/grape1.jpg", "/images/slide4.jpeg", "/images/slide2.jpg"];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [sliderImages.length]);

  // Manual slide control (dots)
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Fetch lands
  const fetchLands = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await getMyLands(userId);
      setLands(data || []);
      if (!data || data.length === 0) setMessage("No lands found");
    } catch (err) {
      console.error(err.response || err);
      setError("❌ Failed to fetch lands");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  // Delete land
  const handleDelete = async (landId) => {
    if (!window.confirm("Are you sure you want to delete this land?")) return;
    try {
      await deleteLand(landId);
      setMessage("✅ Land deleted successfully!");
      fetchLands();
    } catch (err) {
      console.error(err.response || err);
      setError("❌ Failed to delete land");
    }
  };

  // Edit land
  const handleEdit = (land) => {
    setEditingLand(land._id);
    setFormData({
      landName: land.landName,
      locationDistrict: land.locationDistrict,
      gpsCoordinates: land.gpsCoordinates || "",
      landSize: land.landSize,
      soilType: land.soilType || "",
      landPhoto: null,
    });
    setPreviewImage(land.landPhoto ? `http://localhost:5000${land.landPhoto}` : null);
  };

  const handleCancelEdit = () => {
    setEditingLand(null);
    setFormData({});
    setPreviewImage(null);
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      setFormData({ ...formData, landPhoto: file });
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (landId) => {
    try {
      const fd = new FormData();
      for (const key in formData) {
        if (formData[key]) fd.append(key, formData[key]);
      }
      await updateLand(landId, fd);
      setMessage("✅ Land updated successfully!");
      setEditingLand(null);
      setFormData({});
      setPreviewImage(null);
      fetchLands();
    } catch (err) {
      console.error(err.response || err);
      setError("❌ Failed to update land");
    }
  };

  const handleAddLandClick = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      {/* -------- Image Slider -------- */}
      <div
        style={{
          width: "100vw",
          height: "400px",
          position: "relative",
          overflow: "hidden",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        {sliderImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`slide-${index}`}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              transition: "opacity 1s ease-in-out",
              opacity: currentSlide === index ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay with title + description */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <h1 style={{ fontSize: "2em", fontWeight: "bold", marginBottom: "10px" }}>
            Agriculture Lands and Information
          </h1>
          <p style={{ fontSize: "1.1em", maxWidth: "700px", lineHeight: "1.4" }}>
            View, manage, and update your registered agricultural lands in one place.
          </p>
        </div>

        {/* Dots navigation */}
        <div
          style={{
            position: "absolute",
            bottom: "15px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            zIndex: 10,
          }}
        >
          {sliderImages.map((_, index) => (
            <div
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: currentSlide === index ? "#46cc2e" : "#fff",
                opacity: currentSlide === index ? 1 : 0.5,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Floating Back Button */}
        <button
          onClick={() => navigate("/user/profile")}
          style={{
            position: "absolute",
            top: "60px",
            left: "20px",
            padding: "10px 18px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 10,
            boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#5a6268")}
          onMouseLeave={(e) => (e.target.style.background = "#6c757d")}
        >
          ← Back
        </button>
      </div>

      {/* -------- Main Content -------- */}
      <Header />
      <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "10px" }}>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {message && !error && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading lands...</p>
        ) : (
          <>
            {/* Lands Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "25px",
                marginTop: "20px",
              }}
            >
              {lands.length === 0 ? (
                <p style={{ textAlign: "center", gridColumn: "1/-1" }}>No lands found</p>
              ) : (
                lands.map((land) => (
                  <div
                    key={land._id}
                    className="land-card"
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                      background: "#8aa580ff",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {editingLand === land._id ? (
                      <div style={{ padding: "15px" }}>
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: "280px",
                              objectFit: "cover",
                              marginBottom: "15px",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "280px",
                              background: "#333",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              marginBottom: "15px",
                              borderRadius: "10px",
                            }}
                          >
                            No Image
                          </div>
                        )}

                        {/* Edit Form */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            background: "rgba(255, 255, 255, 0.95)",
                            padding: "18px",
                            borderRadius: "12px",
                          }}
                        >
                          <input
                            type="text"
                            name="landName"
                            value={formData.landName}
                            onChange={handleChange}
                            placeholder="Land Name"
                            style={inputStyle}
                          />
                          <input
                            type="text"
                            name="locationDistrict"
                            value={formData.locationDistrict}
                            onChange={handleChange}
                            placeholder="District"
                            style={inputStyle}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              name="gpsCoordinates"
                              value={formData.gpsCoordinates}
                              onChange={handleChange}
                              placeholder="GPS Coordinates"
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      const coords = `${position.coords.latitude.toFixed(
                                        6
                                      )},${position.coords.longitude.toFixed(6)}`;
                                      setFormData({ ...formData, gpsCoordinates: coords });
                                    },
                                    (err) => alert("Failed to get location: " + err.message)
                                  );
                                } else {
                                  alert("Geolocation is not supported by your browser");
                                }
                              }}
                              style={{ ...btnStyle, background: "#17a2b8" }}
                            >
                              Get GPS
                            </button>
                          </div>
                          <input
                            type="number"
                            name="landSize"
                            value={formData.landSize}
                            onChange={handleChange}
                            placeholder="Size (acres)"
                            style={inputStyle}
                          />
                          <input
                            type="text"
                            name="soilType"
                            value={formData.soilType}
                            onChange={handleChange}
                            placeholder="Soil Type"
                            style={inputStyle}
                          />
                          <input
                            type="file"
                            name="landPhoto"
                            accept="image/*"
                            onChange={handleChange}
                            style={inputStyle}
                          />

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button onClick={() => handleSave(land._id)} style={{ ...btnStyle, background: "#28a745" }}>
                              Save
                            </button>
                            <button onClick={handleCancelEdit} style={{ ...btnStyle, background: "#dc3545" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {land.landPhoto ? (
                          <img
                            src={`http://localhost:5000${land.landPhoto}`}
                            alt="land"
                            style={{ width: "100%", height: "300px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "300px",
                              background: "#333",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                          >
                            No Image
                          </div>
                        )}

                        <div style={{ padding: "15px" }}>
                          <h3 style={{ margin: "0 0 10px", color: "#2c3e50" }}>{land.landName}</h3>
                          <p>
                            <strong>Location:</strong> {land.locationDistrict}
                          </p>
                          <p>
                            <strong>GPS:</strong> {land.gpsCoordinates || "-"}
                          </p>
                          <p>
                            <strong>Size:</strong> {land.landSize} acres
                          </p>
                          <p>
                            <strong>Soil:</strong> {land.soilType || "-"}
                          </p>

                          <button onClick={() => handleEdit(land)} style={{ ...btnStyle, background: "#0d6efd", marginRight: "10px" }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(land._id)} style={{ ...btnStyle, background: "#e74c3c" }}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Responsive Fix */}
            <style>
              {`
                .land-card:hover {
                  transform: scale(1.03);
                  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                @media (max-width: 768px) {
                  div[style*="grid-template-columns"] {
                    grid-template-columns: 1fr !important;
                  }
                }
              `}
            </style>

            {/* Add Land Button */}
            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <button
                onClick={handleAddLandClick}
                style={{
                  padding: "12px 20px",
                  background: "#29611fff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "1em",
                }}
              >
                Add New Land
              </button>
            </div>

            {/* Add Land Form */}
            {showForm && (
              <div ref={formRef}>
                <AddLandForm userId={userId} onSuccess={fetchLands} />
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
};

const btnStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
};

export default UserLandsPage;
