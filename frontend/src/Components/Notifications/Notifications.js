import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";

function Notifications({ onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await axios.get("http://localhost:5000/crops", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // ✅ Handle both { crops: [] } and [] response formats
        const data = res.data;
        const crops = Array.isArray(data) ? data : (data.crops || data || []);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let tempNotifications = [];

        crops.forEach((crop) => {
          const harvestDate = new Date(crop.harvestingDate);
          harvestDate.setHours(0, 0, 0, 0);

          const diffTime = harvestDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 🌾 Harvest reminders
          if (diffDays >= 0 && diffDays <= 2) {
            tempNotifications.push({
              id: crop._id + "-harvest",
              title: `${crop.cropName} | ${crop.plot} | ${crop.cropLabel}`,
              message: `Harvesting Reminder: Expected on ${harvestDate.toLocaleDateString()} 🍂`,
            });
          }

          // 💊 Health reminders
          if (crop.healthStatus === "Need Attention") {
            tempNotifications.push({
              id: crop._id + "-health",
              title: `${crop.cropName} | ${crop.plot} | ${crop.cropLabel}`,
              message: `Health Reminder: This crop needs your attention. 🔎`,
            });
          }

          // 🦗 Pest alerts
          if (crop.healthStatus === "Pest Attack") {
            tempNotifications.push({
              id: crop._id + "-pest",
              title: `${crop.cropName} | ${crop.plot} | ${crop.cropLabel}`,
              message: `Pest Alert: Pest attack detected. Take action! 🦗`,
            });
          }
        });

        setNotifications(tempNotifications);

        if (onCountChange) {
          onCountChange(tempNotifications.length);
        }
      } catch (err) {
        console.error("Error fetching crops:", err);
      }
    };

    fetchCrops();
  }, [onCountChange]);

  return (
    <div className="notifications-overlay">
      <div className="notifications-container">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications available</p>
        ) : (
          notifications.map((note) => (
            <div key={note.id} className="notification-card">
              <strong>{note.title}</strong>
              <p>{note.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
