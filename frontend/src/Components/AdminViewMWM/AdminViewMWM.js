import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminViewMWM.css";
import axios from "axios";

function AdminViewMWM(props) {
  const navigate = useNavigate();

  if (!props.market) {
    return (
      <tr>
        <td colSpan="7" className="no-data">No market data available</td>
      </tr>
    );
  }

  const { _id, cropName, marketLocation, pricePerKg, priceDate, TrendIndicator } = props.market;

  const deleteHandler = async () => {
    try {
      console.log("Deleting entry with ID:", _id);
      const res = await axios.delete(`http://localhost:5000/market/${_id}`);
      console.log("Delete response:", res.data);
      // Navigate to /admin_view with a refresh query to trigger refetch
      navigate(`/admin_view?refresh=${Date.now()}`);
    } catch (error) {
      console.error("Delete error:", error);
      navigate("/admin_view"); // Fallback navigation on error
    }
  };

  return (
    <tr>
      <td>{_id}</td>
      <td>{cropName}</td>
      <td>{marketLocation}</td>
      <td>LKR {pricePerKg.toFixed(2)}</td>
      <td>{new Date(priceDate).toLocaleDateString()}</td>
      <td>{TrendIndicator}</td>
      <td className="action-buttons">
        <Link to={`/admin_view/${_id}`}>
          <button className="update-btn">Update</button>
        </Link>
        <button onClick={deleteHandler} className="delete-btn">Delete</button>
      </td>
    </tr>
  );
}

export default AdminViewMWM;