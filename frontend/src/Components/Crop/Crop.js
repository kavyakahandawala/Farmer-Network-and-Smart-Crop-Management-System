import React from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Crop({ crop, onDelete, onUpdateSuccess }) {
  const { _id, cropLabel, cropName, plot, growthStage, healthStatus, plantingDate, harvestingDate, expectedYield } = crop;

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const deleteHandler = async () => {
    try {
      const token = localStorage.getItem("token");
      // Confirm if not complete/failure
      if (growthStage === "Complete" || healthStatus === "Failure") {
        // Allow direct delete for completed/failure crops
        await axios.delete(`http://localhost:5000/crops/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
        onDelete(_id);
        toast.success("Crop deleted successfully ✅");
      } else {
        const confirmDelete = window.confirm("Are you sure you want to delete this crop?");
        if (confirmDelete) {
          await axios.delete(`http://localhost:5000/crops/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
          onDelete(_id);
          toast.success("Crop deleted successfully ✅");
        }
      }
    } catch (err) {
      console.error("Error deleting crop:", err);
      toast.error("Failed to delete crop ❌");
    }
  };

  return (
    <tr>
      <td>{cropLabel}</td>
      <td>{cropName}</td>
      <td>{plot}</td>
      <td>{growthStage}</td>
      <td>{healthStatus}</td>
      <td>{formatDate(plantingDate)}</td>
      <td>{formatDate(harvestingDate)}</td>
      <td>{expectedYield}</td>
      <td className="actions no-print">
        {/* Edit route changed to /update/:id */}
        <Link to={`/updatecrop/${_id}`} title="Edit">✏️</Link>
        <button onClick={deleteHandler} className="delete-btn" title="Delete">🗑️</button>
      </td>
    </tr>
  );
}

export default Crop;
