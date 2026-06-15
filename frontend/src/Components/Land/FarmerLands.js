import React, { useState, useEffect, useCallback } from "react";
import { getMyLands, deleteLand, updateLand } from "./landService";
import AddLandForm from "./AddLandForm";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function FarmerLands({ isAdmin = false, userId }) {
  const [lands, setLands] = useState([]);
  const [editingLandId, setEditingLandId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  const fetchLands = useCallback(async () => {
    try {
      let data;
      if (isAdmin && userId) {
        const { getLandsByFarmer } = await import("./landService");
        data = await getLandsByFarmer(userId);
      } else {
        data = await getMyLands();
      }
      setLands(data);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to load lands");
    }
  }, [isAdmin, userId]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this land?")) return;
    try {
      await deleteLand(id, isAdmin);
      setLands(lands.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete land");
    }
  };

  const startEdit = (land) => {
    setEditingLandId(land._id);
    setEditingForm({
      landName: land.landName,
      locationDistrict: land.locationDistrict,
      gpsCoordinates: land.gpsCoordinates || "",
      landSize: land.landSize,
      soilType: land.soilType || "",
      landPhoto: land.landPhoto || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingForm({ ...editingForm, [name]: value });
  };

  const saveEdit = async () => {
    try {
      await updateLand(editingLandId, editingForm, isAdmin);
      setEditingLandId(null);
      fetchLands();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update land");
    }
  };

  const BACKEND_URL = "http://localhost:5000";

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 900,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    fade: true,
    arrows: false,
    pauseOnHover: false,
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
        }
        .banner-slider {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          margin-top: 0;
          padding-top: 0;
        }
        .banner-slide {
          position: relative;
          height: 420px;
        }
        .banner-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(60%);
        }
        .banner-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
          width: 90%;
          animation: fadeInUp 1.2s ease-in-out;
        }
        .banner-content h2 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 3px 8px rgba(0,0,0,0.4);
        }
        .banner-content p {
          font-size: 1.1em;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.5em;
          text-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, -30%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        .dashboard-container {
          padding: 30px;
          background: #e9f3e9ff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          margin: 20px;
          margin-top: 0;
        }
        .dashboard-title {
          text-align: center;
          font-size: 1.8rem;
          color: #2e7d32;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 20px;
        }
        .dashboard-table th, .dashboard-table td {
          padding: 12px 15px;
          text-align: left;
          font-size: 14px;
        }
        .dashboard-table th {
          background: #81c784;
          color: white;
          font-weight: 600;
        }
        .dashboard-table tr:nth-child(even) {
          background: #f1f8f4;
        }
        .dashboard-table tr:hover {
          background: #e8f5e9;
        }
        .map-cell {
          width: 180px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
        }
        .photo-cell img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 5px;
        }
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .edit-btn {
          background-color: #43a047;
          color: white;
        }
        .edit-btn:hover {
          background-color: #2e7d32;
          transform: scale(1.05);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .delete-btn {
          background-color: #e53935;
          color: white;
        }
        .delete-btn:hover {
          background-color: #c62828;
          transform: scale(1.05);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* 🌾 Full-Width Banner */}
      <div className="banner-slider">
        <Slider {...sliderSettings}>
          {[
            {
              image: "/images/slider-banner1.jpg",
              title: "🌿 My Lands",
              desc: "Manage, track, and visualize your farmlands effortlessly.",
            },
            {
              image: "/images/slider-banner2.jpg",
              title: "🌾 Smart Land Insights",
              desc: "Monitor soil types, GPS locations, and productivity in one view.",
            },
            {
              image: "/images/slider-banner3.jpg",
              title: "🚜 Empowering Farmers",
              desc: "Simplify your land management with smart digital tools.",
            },
          ].map((slide, index) => (
            <div className="banner-slide" key={index}>
              <img src={slide.image} alt={`Slide ${index + 1}`} />
              <div className="banner-content">
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* 🌿 Lands Dashboard */}
      <div className="dashboard-container">
        <AddLandForm userId={userId} isAdmin={isAdmin} onSuccess={fetchLands} />

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Land Name</th>
              <th>Location</th>
              <th>GPS</th>
              <th>Size (acres)</th>
              <th>Soil Type</th>
              <th>Photo</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lands.length > 0 ? (
              lands.map((land) => {
                const coords =
                  land.gpsCoordinates
                    ?.split(",")
                    .map((c) => parseFloat(c.trim())) || [];

                return (
                  <tr key={land._id}>
                    <td>
                      {editingLandId === land._id ? (
                        <input
                          name="landName"
                          value={editingForm.landName}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        land.landName
                      )}
                    </td>
                    <td>
                      {editingLandId === land._id ? (
                        <input
                          name="locationDistrict"
                          value={editingForm.locationDistrict}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        land.locationDistrict
                      )}
                    </td>
                    <td>
                      {coords.length === 2 ? (
                        <div className="map-cell">
                          <MapContainer
                            center={coords}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={coords}>
                              <Popup>{land.landName}</Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      ) : editingLandId === land._id ? (
                        <input
                          name="gpsCoordinates"
                          value={editingForm.gpsCoordinates}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {editingLandId === land._id ? (
                        <input
                          type="number"
                          step="0.01"
                          name="landSize"
                          value={editingForm.landSize}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        land.landSize
                      )}
                    </td>
                    <td>
                      {editingLandId === land._id ? (
                        <input
                          name="soilType"
                          value={editingForm.soilType}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        land.soilType || "-"
                      )}
                    </td>
                    <td className="photo-cell">
                      <img
                        src={
                          land.landPhoto
                            ? `${BACKEND_URL}${land.landPhoto}`
                            : "/images/no-image.png"
                        }
                        alt="land"
                      />
                    </td>
                    <td>
                      {editingLandId === land._id ? (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => setEditingLandId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => startEdit(land)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(land._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    color: "#757575",
                  }}
                >
                  ❌ No lands found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FarmerLands;
