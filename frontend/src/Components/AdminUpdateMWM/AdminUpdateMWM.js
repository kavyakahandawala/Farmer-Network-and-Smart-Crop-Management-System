import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router';
import './AdminUpdateMWM.css';

function AdminUpdateMWM() {
  const [inputs, setInputs] = useState({
    cropName: '',
    marketLocation: '',
    pricePerKg: '',
    priceDate: '',
    TrendIndicator: ''
  });
  const history = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/market/${id}`);
        let marketData = res.data;

        if (marketData.market && typeof marketData.market === 'object') {
          marketData = marketData.market;
        }

        if (marketData.priceDate) {
          marketData.priceDate = new Date(marketData.priceDate)
            .toISOString()
            .split('T')[0];
        }

        setInputs(marketData);
      } catch (error) {
        console.error('API fetch error:', error);
      }
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    await axios.put(`http://localhost:5000/market/${id}`, {
      cropName: String(inputs.cropName),
      marketLocation: String(inputs.marketLocation),
      pricePerKg: Number(inputs.pricePerKg),
      priceDate: inputs.priceDate
        ? new Date(inputs.priceDate).toISOString()
        : undefined,
      TrendIndicator: inputs.TrendIndicator
        ? String(inputs.TrendIndicator)
        : undefined,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate cropName and marketLocation length
    if ((name === "cropName" || name === "marketLocation") && value.length > 15) {
      return; // Prevent updating if length exceeds 15
    }

    // Validate pricePerKg
    if (name === "pricePerKg" && (value === "" || Number(value) > 0)) {
      setInputs((prev) => ({ ...prev, [name]: value }));
    } else if (name === "priceDate") {
      const today = new Date().toISOString().split('T')[0];
      console.log('Today:', today, 'Selected:', value); // Debug date
      if (value > today) return; // block future dates
      setInputs((prev) => ({ ...prev, [name]: value }));
    } else if (name !== "pricePerKg") {
      setInputs((prev) => ({ ...prev, [name]: value }));
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
    await sendRequest();
    history('/admin_view');
  };

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' }).replace(/\//g, '-');
  console.log('Calculated today:', today, 'Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <div className="admin-container">
      <h1>Update Market Entry</h1>

      {!inputs || Object.keys(inputs).length === 0 ? (
        <p>Loading market data...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="cropName">Crop Name</label>
          <input
            type="text"
            id="cropName"
            name="cropName"
            value={inputs.cropName || ''}
            onChange={handleChange}
            required
            maxLength="15"
          />

          <label htmlFor="marketLocation">Market Location</label>
          <input
            type="text"
            id="marketLocation"
            name="marketLocation"
            value={inputs.marketLocation || ''}
            onChange={handleChange}
            required
            maxLength="15"
          />

          <label htmlFor="pricePerKg">Price per Kg (LKR)</label>
          <input
            type="number"
            id="pricePerKg"
            name="pricePerKg"
            step="0.01"
            value={inputs.pricePerKg || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
            min="0.01"
          />

          <label htmlFor="priceDate">Price Date</label>
          <input
            type="date"
            id="priceDate"
            name="priceDate"
            value={inputs.priceDate || ''}
            onChange={handleChange}
            max={today}
            required
          />

          <label htmlFor="TrendIndicator">Trend Indicator</label>
          <select
            id="TrendIndicator"
            name="TrendIndicator"
            value={inputs.TrendIndicator || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Trend</option>
            <option value="Rising">Rising 📈</option>
            <option value="Falling">Falling 📉</option>
            <option value="Stable">Stable ➖</option>
          </select>

          <button type="submit">Save Crop</button>
        </form>
      )}
    </div>
  );
}

export default AdminUpdateMWM;