import React, { useState } from "react";
import { addLand } from "./landService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function AddLandForm({ userId, isAdmin = false, onSuccess }) {
  const [form, setForm] = useState({
    landName: "",
    locationDistrict: "",
    gpsCoordinates: "",
    landSize: "",
    soilType: "",
    landPhoto: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [gpsMessage, setGpsMessage] = useState("");
  const [gpsPosition, setGpsPosition] = useState(null);
  const [showGpsWarning, setShowGpsWarning] = useState(false);

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case "landName":
        if (!value.trim()) return "Land name is required";
        if (value.trim().length < 3)
          return "Land name must be at least 3 characters long";
        return "";
      case "locationDistrict":
        if (!value.trim()) return "Location or district is required";
        if (value.trim().length < 3)
          return "Location or district must be at least 3 characters long";
        return "";
      case "landSize":
        if (!value) return "Land size is required";
        if (isNaN(value) || value <= 0)
          return "Land size must be a positive number";
        if (value > 1000) return "Land size cannot exceed 1000 acres";
        return "";
      case "soilType":
        if (!value.trim()) return "Soil type is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "landPhoto") {
      setForm({ ...form, landPhoto: files[0] });
    } else {
      setForm({ ...form, [name]: value });
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  // GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsMessage("❌ Geolocation not supported by this browser");
      setTimeout(() => setGpsMessage(""), 3000);
      return;
    }
    setShowGpsWarning(true);
  };

  const confirmGps = () => {
    setShowGpsWarning(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(
          6
        )}, ${position.coords.longitude.toFixed(6)}`;
        setForm({ ...form, gpsCoordinates: coords });
        setGpsPosition([position.coords.latitude, position.coords.longitude]);
        setGpsMessage("📍 Location detected!");
        setTimeout(() => setGpsMessage(""), 3000);
      },
      () => {
        setGpsMessage("❌ Failed to detect location");
        setTimeout(() => setGpsMessage(""), 3000);
      }
    );
  };

  const cancelGps = () => setShowGpsWarning(false);

  const validateForm = () => {
    const newErrors = {
      landName: validateField("landName", form.landName),
      locationDistrict: validateField("locationDistrict", form.locationDistrict),
      landSize: validateField("landSize", form.landSize),
      soilType: validateField("soilType", form.soilType),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("❌ Please fix the errors in the form");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      if (isAdmin && userId) formData.append("farmerId", userId);
      formData.append("landName", form.landName.trim());
      formData.append("locationDistrict", form.locationDistrict.trim());
      formData.append("gpsCoordinates", form.gpsCoordinates);
      formData.append("landSize", form.landSize);
      formData.append("soilType", form.soilType.trim());
      if (form.landPhoto) formData.append("landPhoto", form.landPhoto);

      await addLand(formData, isAdmin);
      setMessage("✅ Land added successfully!");
      setForm({
        landName: "",
        locationDistrict: "",
        gpsCoordinates: "",
        landSize: "",
        soilType: "",
        landPhoto: null,
      });
      setErrors({});
      setGpsPosition(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err.response || err);
      if (err.response?.status === 403) {
        setMessage("❌ Session expired. Please log in again.");
      } else {
        setMessage("❌ Failed to add land");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "50px auto",
        padding: "35px 40px",
        backgroundColor: "#2b5225ff",
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#39ae3fff",
          fontSize: "1.9rem",
          fontWeight: "600",
          marginBottom: "25px",
        }}
      >
        🌿 Add New Land
      </h2>

      {message && (
        <p
          style={{
            textAlign: "center",
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "20px",
            fontWeight: "500",
            backgroundColor: message.includes("✅") ? "#E8F5E9" : "#FFEBEE",
            color: message.includes("✅") ? "#2e7d32" : "#d32f2f",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {[
          { label: "Land Name", name: "landName", type: "text", placeholder: "Enter land name" },
          {
            label: "Location / District",
            name: "locationDistrict",
            type: "text",
            placeholder: "Enter location or district",
          },
          {
            label: "Land Size (in acres)",
            name: "landSize",
            type: "number",
            placeholder: "Enter land size",
          },
          {
            label: "Soil Type",
            name: "soilType",
            type: "text",
            placeholder: "Enter soil type (e.g., Loamy, Sandy)",
          },
        ].map((field) => (
          <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#9de7a1ff", fontWeight: "500" }}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              required
              style={{
                padding: "12px",
                border: `2px solid ${errors[field.name] ? "#d32f2f" : "#c8e6c9"}`,
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors[field.name] ? "#d32f2f" : "#43a047")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors[field.name] ? "#d32f2f" : "#c8e6c9")
              }
            />
            {errors[field.name] && (
              <p style={{ color: "#d32f2f", fontSize: "0.9rem" }}>{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* GPS Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#9ae79eff", fontWeight: "500" }}>
            GPS Coordinates (optional)
          </label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              name="gpsCoordinates"
              placeholder="e.g., 12.345, 67.890"
              value={form.gpsCoordinates}
              onChange={handleChange}
              style={{
                flex: 1,
                padding: "12px",
                border: "2px solid #c8e6c9",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
            <button
              type="button"
              onClick={handleDetectGPS}
              style={{
                backgroundColor: "#43a047",
                color: "white",
                padding: "12px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Detect GPS
            </button>
          </div>
          {gpsMessage && (
            <p style={{ color: "#2e7d32", fontSize: "0.9rem" }}>{gpsMessage}</p>
          )}
        </div>

        {showGpsWarning && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff8e1",
              padding: "16px",
              border: "2px solid #ffc107",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              textAlign: "center",
              zIndex: 999,
            }}
          >
            <p style={{ marginBottom: "10px", fontWeight: "500" }}>
              ⚠ Please ensure you're at the actual land location.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={confirmGps}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#43a047",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Confirm
              </button>
              <button
                onClick={cancelGps}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {gpsPosition && (
          <div
            style={{
              height: "220px",
              borderRadius: "12px",
              overflow: "hidden",
              marginTop: "8px",
            }}
          >
            <MapContainer center={gpsPosition} zoom={15} style={{ height: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={gpsPosition}>
                <Popup>Your land location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Land Photo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#9ee4a2ff", fontWeight: "500" }}>
            Land Photo (optional)
          </label>
          <input
            type="file"
            name="landPhoto"
            accept="image/*"
            onChange={handleChange}
            style={{
              padding: "10px",
              border: "2px solid #c8e6c9",
              borderRadius: "8px",
              background: "#fafafa",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Submit Button */}
<div style={{ display: "flex", justifyContent: "center" }}>
  <button
    type="submit"
    disabled={loading}
    style={{
      backgroundColor: loading ? "#a5d6a7" : "#4caf50",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 30px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      width: "fit-content",
      minWidth: "160px",
      textAlign: "center",
    }}
  >
    {loading ? "Adding..." : "Add Land"}
  </button>
</div>

      </form>
    </div>
  );
}

export default AddLandForm;
