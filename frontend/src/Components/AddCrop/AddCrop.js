import React, { useState } from 'react';
import Nav from "../Nav/Nav";
import { useNavigate } from "react-router";
import axios from "axios";
import "./AddCrop.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";

function AddCrop() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    cropLabel: "",
    cropName: "",
    plot: "",
    growthStage: "",
    healthStatus: "",
    plantingDate: "",
    harvestingDate: "",
    expectedYield: "",
  });

  const districts = [
    "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya","Galle","Matara","Hambantota",
    "Jaffna","Kilinochchi","Mannar","Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
    "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla","Monaragala","Ratnapura","Kegalle"
  ];

  const cropSuggestions = {
    Colombo: ["Rice", "Coconut", "Banana", "Vegetables"],
    Gampaha: ["Pineapple", "Banana", "Papaya", "Coconut"],
    Kalutara: ["Rubber", "Coconut", "Pepper", "Cinnamon"],
    Kandy: ["Tea", "Spices", "Vegetables", "Ginger"],
    Matale: ["Pepper", "Cardamom", "Cloves", "Nutmeg"],
    "Nuwara Eliya": ["Tea", "Potato", "Carrot", "Cabbage"],
    Galle: ["Cinnamon", "Coconut", "Banana", "Pepper"],
    Matara: ["Cinnamon", "Tea", "Banana", "Rubber"],
    Hambantota: ["Paddy", "Groundnut", "Chili", "Onion"],
    Jaffna: ["Onion", "Chili", "Tobacco", "Brinjal"],
    Kilinochchi: ["Paddy", "Chili", "Onion", "Cowpea"],
    Mannar: ["Paddy", "Groundnut", "Onion", "Chili"],
    Vavuniya: ["Paddy", "Vegetables", "Chili", "Pulses"],
    Mullaitivu: ["Paddy", "Chili", "Vegetables", "Maize"],
    Batticaloa: ["Paddy", "Coconut", "Banana", "Vegetables"],
    Ampara: ["Paddy", "Maize", "Groundnut", "Chili"],
    Trincomalee: ["Paddy", "Coconut", "Banana", "Vegetables"],
    Kurunegala: ["Paddy", "Coconut", "Pepper", "Mango"],
    Puttalam: ["Coconut", "Paddy", "Chili", "Onion"],
    Anuradhapura: ["Paddy", "Mung Beans", "Sesame", "Corn"],
    Polonnaruwa: ["Paddy", "Banana", "Chili", "Mung Beans"],
    Badulla: ["Tea", "Potato", "Carrot", "Vegetables"],
    Monaragala: ["Paddy", "Maize", "Groundnut", "Chili"],
    Ratnapura: ["Rubber", "Tea", "Cinnamon", "Coconut"],
    Kegalle: ["Rubber", "Pepper", "Cloves", "Tea"]
  };

  const growthStages = [
    "Germinating", "Vegetative", "Flowering", "Maturity", "Harvesting",
  ];

  const healthStatuses = ["Healthy", "Need Attention", "Pest Attack"];

  const isFuturePlanting = () => {
    if (!inputs.plantingDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planting = new Date(inputs.plantingDate);
    return planting > today;
  };

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add crops");
      history("/login");
      return;
    }

    if (!districts.includes(inputs.plot)) {
      alert("Please select a valid district from the dropdown list.");
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

    sendRequest()
      .then(() => {
        toast.success("Crop added successfully! ✅");
        history("/cropList");
      })
      .catch((err) => {
        console.error("Add crop error:", err);
        toast.error("Failed to add crop. Please try again.");
      });
  };

  const sendRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.post(
      "http://localhost:5000/crops",
      {
        cropLabel: String(inputs.cropLabel),
        cropName: String(inputs.cropName),
        plot: String(inputs.plot),
        growthStage: String(inputs.growthStage),
        healthStatus: String(inputs.healthStatus),
        plantingDate: String(inputs.plantingDate),
        harvestingDate: String(inputs.harvestingDate),
        expectedYield: parseFloat(inputs.expectedYield),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Add Crop</title>
      </Helmet>

      <Header />

      <div className="add-crop-page-wrapper">
        <div className="create-crop-page">
          <h1 className="title">AgroSphere</h1>
          <p className="subtitle">Create your new crop record</p>

          <div className="form-container">
            <Nav />

            <form onSubmit={handleSubmit} className="crop-form">
              <div className="form-row vertical-field">
                <label>Plot (District)</label>
                <input
                  type="text"
                  name="plot"
                  list="district-options"
                  onChange={handleChange}
                  value={inputs.plot}
                  required
                />
                <datalist id="district-options">
                  {districts.map((d, i) => (
                    <option key={i} value={d} />
                  ))}
                </datalist>
              </div>

              <div className="form-row vertical-field">
                <label>Crop Name</label>
                <input
                  type="text"
                  name="cropName"
                  list="crop-options"
                  onChange={handleChange}
                  value={inputs.cropName}
                  required
                />
                <datalist id="crop-options">
                  {(cropSuggestions[inputs.plot] || []).map((crop, i) => (
                    <option key={i} value={crop} />
                  ))}
                </datalist>
              </div>

              <div className="form-row vertical-field">
                <label>Crop Label</label>
                <input
                  type="text"
                  name="cropLabel"
                  onChange={handleChange}
                  value={inputs.cropLabel}
                  placeholder="Optional - Use to clearly identify plot/crop"
                />
              </div>

              <div className="form-row vertical-field">
                <label>Planting/Planted Date</label>
                <input
                  type="date"
                  name="plantingDate"
                  onChange={handleChange}
                  value={inputs.plantingDate}
                  required
                />
              </div>

              <div className="form-row vertical-field">
                <label>Expected Harvest Date</label>
                <input
                  type="date"
                  name="harvestingDate"
                  onChange={handleChange}
                  value={inputs.harvestingDate}
                  required
                />
              </div>

              <div className="form-row vertical-field">
                <label>Expected Yield (kg)</label>
                <input
                  type="number"
                  name="expectedYield"
                  onChange={handleChange}
                  value={inputs.expectedYield}
                  step="0.01"
                  min="0.1"
                  max="100000"
                  required
                />
              </div>

              <div className="form-row horizontal-fields">
                <div className="field-group">
                  <label>Growth Stage</label>
                  <select
                    name="growthStage"
                    onChange={handleChange}
                    value={inputs.growthStage}
                    required
                  >
                    <option value="" disabled>
                      Select a stage
                    </option>
                    {isFuturePlanting() ? (
                      <>
                        <option value="Pending planting">Pending planting</option>
                        {growthStages.map((stage, i) => (
                          <option key={i} value={stage} disabled>
                            {stage}
                          </option>
                        ))}
                      </>
                    ) : (
                      growthStages.map((stage, i) => (
                        <option key={i} value={stage}>
                          {stage}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="field-group">
                  <label>Health Status</label>
                  <select
                    name="healthStatus"
                    onChange={handleChange}
                    value={inputs.healthStatus}
                    required
                  >
                    <option value="" disabled>
                      Select health status
                    </option>
                    {isFuturePlanting() ? (
                      <>
                        <option value="Pending planting">Pending planting</option>
                        {healthStatuses.map((status, i) => (
                          <option key={i} value={status} disabled>
                            {status}
                          </option>
                        ))}
                      </>
                    ) : (
                      healthStatuses.map((status, i) => (
                        <option key={i} value={status}>
                          {status}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <button type="submit" className="create-btn">
                Create
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AddCrop;
