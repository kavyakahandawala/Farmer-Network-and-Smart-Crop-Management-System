import React, { useState } from 'react';
import './AdminMarketWM.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminMarketWM() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    cropId: "",
    cropName: "",
    marketLocation: "",
    pricePerKg: "",
    priceDate: "",
    TrendIndicator: ""
  });
  const [error, setError] = useState(null);

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate cropName and marketLocation length
    if ((name === "cropName" || name === "marketLocation") && value.length > 15) {
      return; // Prevent updating if length exceeds 15
    }
    
    // Validate pricePerKg
    if (name === "pricePerKg" && (value === "" || Number(value) > 0)) {
      setInputs((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (name !== "pricePerKg") {
      setInputs((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Prevent typing minus sign or zero as first character for pricePerKg
  const handleKeyDown = (e) => {
    if (e.key === '-' || (e.key === '0' && e.target.value === "")) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form inputs:", inputs);
    setError(null);
    try {
      const response = await sendRequest();
      console.log("POST response:", response);
      history('/admin_view?t=' + Date.now()); // Force refresh
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.message);
    }
  };

  const sendRequest = async () => {
    const payload = {
      cropId: inputs.cropId ? String(inputs.cropId) : undefined,
      cropName: String(inputs.cropName),
      marketLocation: String(inputs.marketLocation),
      pricePerKg: Number(inputs.pricePerKg),
      priceDate: inputs.priceDate ? new Date(inputs.priceDate).toISOString() : undefined,
      TrendIndicator: inputs.TrendIndicator ? String(inputs.TrendIndicator) : undefined,
    };
    const response = await axios.post("http://localhost:5000/market", payload);
    return response.data;
  };

  return (
    <div>
      <div className="tab-content">
        <div className="admin-container">
          <h1>Market Watch - Add Crop</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="cropName">Crop Name</label>
            <input 
              type="text" 
              id="cropName" 
              onChange={handleChange} 
              value={inputs.cropName} 
              name="cropName" 
              required 
              maxLength="15"
            />

            <label htmlFor="marketLocation">Market Location</label>
            <input 
              type="text" 
              id="marketLocation" 
              onChange={handleChange} 
              value={inputs.marketLocation} 
              name="marketLocation" 
              required 
              maxLength="15"
            />

            <label htmlFor="pricePerKg">Price per Kg (LKR)</label>
            <input 
              type="number" 
              id="pricePerKg" 
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              value={inputs.pricePerKg} 
              name="pricePerKg" 
              step="0.01" 
              required 
              min="0.01"
            />

            <label htmlFor="priceDate">Price Date</label>
            <input 
              type="date" 
              id="priceDate" 
              onChange={handleChange} 
              value={inputs.priceDate} 
              name="priceDate" 
              required 
              max={today} 
            />

            <label htmlFor="TrendIndicator">Trend Indicator</label>
            <select id="TrendIndicator" onChange={handleChange} value={inputs.TrendIndicator} name="TrendIndicator" required>
              <option value="">Select Trend</option>
              <option value="Rising">Rising 📈</option>
              <option value="Falling">Falling 📉</option>
              <option value="Stable">Stable ➖</option>
            </select>

            <button type="submit">Save Crop</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminMarketWM;