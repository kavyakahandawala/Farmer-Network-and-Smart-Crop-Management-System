import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  FaUsers,
  FaTractor,
  FaStore,
  FaComments,
  FaSeedling,
  FaSignOutAlt,
  FaTachometerAlt,
  FaQuestionCircle,
} from 'react-icons/fa';
import AdminViewMWM from '../AdminViewMWM/AdminViewMWM';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "./MarketWMdetails.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const URL = "http://localhost:5000/market";

const fetchHandlers = async () => {
  try {
    const res = await axios.get(URL);
    console.log("Raw API response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fetch error details:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null
    });
    throw error;
  }
};

function MarketWMdetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [market, setMarket] = useState([]);
  const [filteredMarket, setFilteredMarket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [trendFilter, setTrendFilter] = useState('');

  const componentRef = useRef();

  useEffect(() => {
    fetchHandlers()
      .then((data) => {
        console.log("API Response:", data);
        const marketData = Array.isArray(data) ? data : data.Market || data.market || [];
        console.log("Processed market data:", marketData);
        setMarket(marketData);
        setFilteredMarket(marketData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error.message);
        setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      });
  }, [location.search]);

  useEffect(() => {
    let filtered = [...market];

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.marketLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceFilter) {
      filtered = filtered.filter(entry => entry.pricePerKg >= parseFloat(priceFilter));
    }

    if (cropFilter) {
      filtered = filtered.filter(entry => entry.cropName === cropFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(entry => entry.marketLocation === locationFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.priceDate).toISOString().split('T')[0];
        return entryDate === dateFilter;
      });
    }

    if (trendFilter) {
      filtered = filtered.filter(entry => entry.TrendIndicator === trendFilter);
    }

    setFilteredMarket(filtered);
  }, [searchTerm, priceFilter, cropFilter, locationFilter, dateFilter, trendFilter, market]);

  const availableCrops = [...new Set(market.map(entry => entry.cropName))];
  const availableLocations = [...new Set(market.map(entry => entry.marketLocation))];
  const availableTrends = [...new Set(market.map(entry => entry.TrendIndicator))];
  const today = new Date().toISOString().split('T')[0];

  // Prepare bar chart data
  const uniqueCrops = [...new Set(filteredMarket.map(entry => entry.cropName.toLowerCase()))];
  const chartData = {
    labels: uniqueCrops.map(crop => crop.charAt(0).toUpperCase() + crop.slice(1)),
    datasets: [
      {
        label: 'Average Price per Kg (LKR)',
        data: uniqueCrops.map(crop => {
          const cropEntries = filteredMarket.filter(entry => entry.cropName.toLowerCase() === crop);
          const avgPrice = cropEntries.length
            ? cropEntries.reduce((sum, entry) => sum + entry.pricePerKg, 0) / cropEntries.length
            : 0;
          return parseFloat(avgPrice.toFixed(2));
        }),
        backgroundColor: 'rgba(46, 125, 50, 0.8)',
        borderColor: 'rgba(27, 94, 32, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1a3c34',
        },
      },
      title: {
        display: true,
        text: 'Crop Prices (LKR)',
        color: '#1a3c34',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Crop Name',
          color: '#1a3c34',
        },
        ticks: {
          color: '#1a3c34',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price per Kg (LKR)',
          color: '#1a3c34',
        },
        ticks: {
          color: '#1a3c34',
        },
        beginAtZero: true,
      },
    },
  };

  // Prepare line chart data with prediction
  const predictFuturePrices = (crop) => {
    const cropEntries = filteredMarket
      .filter(entry => entry.cropName.toLowerCase() === crop.toLowerCase())
      .sort((a, b) => new Date(a.priceDate) - new Date(b.priceDate));
    if (cropEntries.length < 3) return { labels: [], data: [] }; // Need at least 3 points for trend

    const lastEntries = cropEntries.slice(-3); // Use last 3 data points
    const dates = lastEntries.map(entry => new Date(entry.priceDate));
    const prices = lastEntries.map(entry => entry.pricePerKg);

    // Simple linear regression (slope and intercept)
    const n = prices.length;
    const sumX = dates.reduce((sum, date, i) => sum + i, 0);
    const sumY = prices.reduce((sum, y) => sum + y, 0);
    const sumXY = dates.reduce((sum, date, i) => sum + i * prices[i], 0);
    const sumXX = dates.reduce((sum, date, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 7 days
    const futureDates = [];
    const futurePrices = [];
    const lastDate = new Date(dates[dates.length - 1]);
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      futureDates.push(futureDate.toISOString().split('T')[0]);
      futurePrices.push((slope * (n + i - 1) + intercept).toFixed(2));
    }

    return { labels: futureDates, data: futurePrices };
  };

  const lineChartData = {
    labels: [],
    datasets: uniqueCrops.map(crop => {
      const { labels, data } = predictFuturePrices(crop);
      return {
        label: `Predicted ${crop.charAt(0).toUpperCase() + crop.slice(1)} Price`,
        data,
        fill: false,
        borderColor: 'rgba(27, 114, 88, 1)', // Blue for predictions
        backgroundColor: 'rgba(106, 205, 154, 0.8)',
        tension: 0.1,
      };
    }).filter(dataset => dataset.data.length > 0), // Only include if prediction is valid
  };

  lineChartData.labels = lineChartData.datasets.length > 0 ? lineChartData.datasets[0].data.map((_, i) => i + 1).map(day => `Day ${day}`) : [];

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#1a3c34' } },
      title: { display: true, text: 'Predicted Crop Prices (Next 7 Days)', color: '#1a3c34', font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: 'Day', color: '#1a3c34' }, ticks: { color: '#1a3c34' } },
      y: { title: { display: true, text: 'Price per Kg (LKR)', color: '#1a3c34' }, ticks: { color: '#1a3c34' }, beginAtZero: true },
    },
  };

  // Generating PDF report with jsPDF
  const generateReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('AgroSphere Market Prices Report', 105, 15, { align: 'center' });
    
    // Add generation date and time
    doc.setFontSize(10);
    const generatedOn = `Generated on ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Colombo' })} at ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo' })}`;
    doc.text(generatedOn, 105, 25, { align: 'center' });

    // Add filters
    const filters = [
      searchTerm ? `Search Term: ${searchTerm}` : '',
      priceFilter ? `Minimum Price: ${priceFilter} LKR` : '',
      cropFilter ? `Crop: ${cropFilter}` : '',
      locationFilter ? `Location: ${locationFilter}` : '',
      dateFilter ? `Date: ${dateFilter}` : '',
      trendFilter ? `Trend: ${trendFilter}` : ''
    ].filter(Boolean).join(' | ');
    
    doc.setFontSize(10);
    doc.text('Filters Applied:', 14, 35);
    doc.text(filters, 14, 42, { maxWidth: 180 });

    // Generate table
    autoTable(doc, {
      startY: 50,
      head: [['ID', 'Crop Name', 'Market Location', 'Price per Kg (LKR)', 'Date', 'Trend']],
      body: filteredMarket.map(entry => [
        entry._id,
        entry.cropName,
        entry.marketLocation,
        entry.pricePerKg.toFixed(2),
        new Date(entry.priceDate).toISOString().split('T')[0],
        entry.TrendIndicator
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [0, 100, 0], // Dark green
        textColor: [255, 255, 255], // White text for contrast
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // ID
        1: { cellWidth: 40 }, // Crop Name
        2: { cellWidth: 40 }, // Market Location
        3: { cellWidth: 30, halign: 'center' }, // Price per Kg
        4: { cellWidth: 30, halign: 'center' }, // Date
        5: { cellWidth: 20, halign: 'center' }  // Trend
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      margin: { top: 50, left: 14, right: 14 }
    });

    // Save the PDF
    doc.save(`AgroSphere_Market_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriceFilter('');
    setCropFilter('');
    setLocationFilter('');
    setDateFilter('');
    setTrendFilter('');
  };

  if (loading) {
    return <div>Loading market data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Market Prices</title>
      </Helmet>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div className="sidebar">
          <ul className="menu">
            <li className="active">
              <Link to="/admin">
                <FaTachometerAlt /> <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard">
                <FaUsers /> <span>User Management</span>
              </Link>
            </li>
            <li>
              <Link to="/marketwatch">
                <FaStore /> <span>Market Watch</span>
              </Link>
            </li>
            <li>
                <Link to="/admin/productable">
                  <i className="fa fa-seedling"></i>
                  <span>Add Crop Inputs</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/payment">
                  <i className="fa fa-seedling"></i>
                  <span>Order Management</span>
                </Link>
              </li>
              <li>
              <Link to="/admin/qaforum">
                <FaComments /> <span>Q & A Forum</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/qapost">
                <FaQuestionCircle /> <span>Q & A Post</span>
              </Link>
            </li>
            <li>
              <a
                href="/login"
                onClick={(e) => {
                  if (!window.confirm("Are you sure you want to Logout?")) e.preventDefault();
                }}
              >
                <FaSignOutAlt /> <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="market-container">
          <div className="filters-container">
            <input
              type="text"
              placeholder="Search by crop name or market location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search by crop name or market location"
            />
            <input
              type="number"
              placeholder="Min price per Kg (LKR)"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="filter-input"
              step="0.01"
              aria-label="Minimum price per kilogram in LKR"
            />
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by crop"
            >
              <option value="">All Crops</option>
              {availableCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by market location"
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-input"
              max={today}
              aria-label="Filter by date"
            />
            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by trend"
            >
              <option value="">All Trends</option>
              {availableTrends.map(trend => (
                <option key={trend} value={trend}>{trend}</option>
              ))}
            </select>
            <button
              onClick={() => {
                console.log("Generate Report button clicked");
                generateReport();
              }}
              className="print-btn"
              aria-label="Generate market report PDF"
            >
              Generate Report
            </button>
            <button
              onClick={resetFilters}
              className="reset-btn"
              aria-label="Reset all filters"
            >
              Reset Filters
            </button>
          </div>

          <div ref={componentRef} className="market-table-container">
            <button
              onClick={() => navigate('/admin/market')}
              className="add-price-btn"
              aria-label="Add new price entry"
            >
              + Add Price
            </button>
            <h2 className="market-entry-title">Market Entry</h2>
            <table className="market-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Crop Name</th>
                  <th>Market Location</th>
                  <th className="price-column">Price per Kg (LKR)</th>
                  <th>Date</th>
                  <th>Trend</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarket.map((entry) => (
                  <AdminViewMWM key={entry._id} market={entry} />
                ))}
              </tbody>
            </table>
            <div className="chart-container" style={{ marginTop: '20px', maxWidth: '800px' }}>
              {uniqueCrops.length > 0 ? (
                <>
                  <Bar data={chartData} options={chartOptions} />
                  {lineChartData.datasets.length > 0 ? (
                    <Line data={lineChartData} options={lineChartOptions} style={{ marginTop: '20px' }} />
                  ) : (
                    <p>No sufficient data for price prediction (need at least 3 entries per crop).</p>
                  )}
                </>
              ) : (
                <p>No data available for the chart based on current filters.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MarketWMdetails;