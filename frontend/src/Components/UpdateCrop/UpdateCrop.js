import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from "../Nav/Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../UpdateCrop/UpdateCrop.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet } from "react-helmet";

function UpdateCrop() {
  const [inputs, setInputs] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const history = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to update crops");
          history('/login');
          return;
        }

        const res = await axios.get(`http://localhost:5000/crops/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const crop = res.data.crop || res.data;
        // Normalize date fields to YYYY-MM-DD for inputs
        if (crop.plantingDate) {
          crop.plantingDate = new Date(crop.plantingDate).toISOString().split("T")[0];
        }
        if (crop.harvestingDate) {
          crop.harvestingDate = new Date(crop.harvestingDate).toISOString().split("T")[0];
        }

        setInputs(crop);

        if (crop.growthStage === "Complete") {
          setIsLocked(true);
        }
      } catch (error) {
        console.error("Error fetching crop:", error);
        if (error.response && error.response.status === 403) {
          toast.error("You don't have permission to update this crop");
        } else if (error.response && error.response.status === 404) {
          toast.error("Crop not found");
        } else {
          toast.error("Failed to load crop details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id, history]);

  const sendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to update crops");
        return;
      }

      const response = await axios.put(`http://localhost:5000/crops/${id}`, {
        cropLabel: String(inputs.cropLabel || ""),
        cropName: String(inputs.cropName || ""),
        plot: String(inputs.plot || ""),
        growthStage: String(inputs.growthStage || ""),
        healthStatus: String(inputs.healthStatus || ""),
        plantingDate: String(inputs.plantingDate || ""),
        harvestingDate: String(inputs.harvestingDate || ""),
        expectedYield: parseFloat(inputs.expectedYield || 0),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (inputs.growthStage === "Complete") {
        setIsLocked(true);
      }

      return response.data;
    } catch (error) {
      console.error("Error updating crop:", error);
      if (error.response && error.response.status === 403) {
        toast.error("You don't have permission to update this crop");
      } else {
        toast.error("Failed to update crop");
      }
      throw error;
    }
  };

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const growthStages = [
    "Germinating",
    "Vegetative",
    "Flowering",
    "Maturity",
    "Harvesting",
    "Complete"
  ];

  const healthStatuses = [
    "Healthy",
    "Need Attention",
    "Pest Attack",
    "Failure"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      alert("This crop has been completed and cannot be updated.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const harvestDate = new Date(inputs.harvestingDate);

    if (harvestDate < today) {
      alert("Expected Harvest Date must be today or a future date.");
      return;
    }

    if (isNaN(inputs.expectedYield) || inputs.expectedYield <= 0) {
      alert("Please enter a valid expected yield greater than 0 kg.");
      return;
    }

    if (inputs.expectedYield > 100000) {
      alert("Expected Yield seems too high. Please enter a realistic value (less than 100,000 kg).");
      return;
    }

    try {
      await sendRequest();
      toast.success("Crop updated successfully!");
      // go back to list after short delay to show toast
      setTimeout(() => {
        history('/cropList');
      }, 800);
    } catch (error) {
      // errors already handled in sendRequest
    }
  };

  const isFuturePlantingDate =
    inputs.plantingDate && new Date(inputs.plantingDate) > new Date();

  if (loading) {
    return (
      <div className="create-crop-page">
        <Nav />
        <div className="form-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading crop details...
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>AgroSphere | Update Crop</title></Helmet>
      <Header />
    <div className="update-crop-page-wrapper">
    <div className="create-crop-page">
      <h1 className="title">AgroSphere</h1>
      <p className="subtitle">Update crop details!</p>

      {isLocked && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          This crop has been completed and cannot be updated.
        </p>
      )}

      <div className="form-container">
        <Nav />

        <form onSubmit={handleSubmit} className="crop-form">
          <div className="form-row">
            <label>Plot (District)</label>
            <input
              type="text"
              name="plot"
              list="district-options"
              onChange={handleChange}
              value={inputs.plot || ""}
              disabled
              required
            />
            <datalist id="district-options"></datalist>

            <label>Crop Name</label>
            <input
              type="text"
              name="cropName"
              list="crop-options"
              onChange={handleChange}
              value={inputs.cropName || ""}
              disabled
              required
            />
            <datalist id="crop-options"></datalist>
          </div>

          <div className="form-row single">
            <label>Crop Label</label>
            <input
              type="text"
              name="cropLabel"
              onChange={handleChange}
              value={inputs.cropLabel || ""}
              placeholder="Optional - Use to clearly identify plot/crop"
              disabled={isLocked}
            />
          </div>

          <div className="form-row single">
            <label>Planting/Planted Date</label>
            <input
              type="date"
              name="plantingDate"
              onChange={handleChange}
              value={inputs.plantingDate || ""}
              disabled={
                isLocked || (inputs.plantingDate && new Date(inputs.plantingDate) < new Date())
              }
              required
            />
          </div>

          <div className="form-row single">
            <label>Expected Harvest Date</label>
            <input
              type="date"
              name="harvestingDate"
              onChange={handleChange}
              value={inputs.harvestingDate || ""}
              disabled={isLocked}
              required
            />
          </div>

          <div className="form-row single">
            <label>Expected Yield (kg)</label>
            <input
              type="number"
              name="expectedYield"
              onChange={handleChange}
              value={inputs.expectedYield || ""}
              step="0.01"
              min="0.1"
              max="100000"
              disabled={isLocked}
              required
            />
          </div>

          <div className="form-row">
            <label>Growth Stage</label>
            <select
              name="growthStage"
              onChange={handleChange}
              value={inputs.growthStage || ""}
              disabled={isLocked || isFuturePlantingDate}
              required
            >
              <option value="" disabled>Select a stage</option>
              {isFuturePlantingDate ? (
                <option value="Pending planting">Pending planting</option>
              ) : (
                growthStages.map((stage, i) => (
                  <option key={i} value={stage}>{stage}</option>
                ))
              )}
              {isFuturePlantingDate && growthStages.map((stage, i) => (
                <option key={i} value={stage} disabled>{stage}</option>
              ))}
            </select>

            <label>Health Status</label>
            <select
              name="healthStatus"
              onChange={handleChange}
              value={inputs.healthStatus || ""}
              disabled={isLocked || isFuturePlantingDate}
              required
            >
              <option value="" disabled>Select health status</option>
              {isFuturePlantingDate ? (
                <option value="Pending planting">Pending planting</option>
              ) : (
                healthStatuses.map((status, i) => (
                  <option key={i} value={status}>{status}</option>
                ))
              )}
              {isFuturePlantingDate && healthStatuses.map((status, i) => (
                <option key={i} value={status} disabled>{status}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="create-btn" disabled={isLocked}>
              Update Crop
            </button>

            <button
              type="button"
              className="create-btn"
              onClick={() => history('/cropList')}
              style={{
                backgroundColor: '#6c757d',
                marginTop: '10px'
              }}
            >
              Back to My Crops
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
    </div>
     <Footer/>
    </>
  );
}

export default UpdateCrop;
