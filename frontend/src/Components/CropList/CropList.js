import React, { useEffect, useState, useRef } from 'react';
import Nav from "../Nav/Nav";
import axios from "axios";
import Crop from '../Crop/Crop';
import Notifications from "../Notifications/Notifications";
import './CropList.css';
import { Helmet } from "react-helmet";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const URL = "http://localhost:5000/crops";

const fetchHandler = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Expect res.data to be either { crops: [...] } or an array
    return res.data;
  } catch (error) {
    console.error("Fetch crops error:", error);
    toast.error("Failed to load crops. Please try again.");
    return { crops: [] };
  }
};

function CropList() {
  const [crops, setCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [filterGrowthStage, setFilterGrowthStage] = useState('');
  const [filterPlot, setFilterPlot] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const ComponentsRef = useRef();

  useEffect(() => {
    fetchHandler().then((data) => {
      const cropData = Array.isArray(data) ? data : (data.crops || data || []);
      setCrops(Array.isArray(cropData) ? cropData : []);
      setFilteredCrops(Array.isArray(cropData) ? cropData : []);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, filterGrowthStage, filterPlot);
  };

  const applyFilters = (search = '', growthStage = '', plot = '') => {
    let result = crops || [];

    if (search) {
      result = result.filter(crop =>
        (crop.cropLabel && crop.cropLabel.toLowerCase().includes(search)) ||
        (crop.cropName && crop.cropName.toLowerCase().includes(search)) ||
        (crop.plot && crop.plot.toLowerCase().includes(search)) ||
        (crop.growthStage && crop.growthStage.toLowerCase().includes(search)) ||
        (crop.healthStatus && crop.healthStatus.toLowerCase().includes(search)) ||
        (crop.plantingDate && crop.plantingDate.toLowerCase().includes(search)) ||
        (crop.harvestingDate && crop.harvestingDate.toLowerCase().includes(search)) ||
        (crop.expectedYield && crop.expectedYield.toString().includes(search))
      );
    }

    if (growthStage) {
      result = result.filter(crop => crop.growthStage === growthStage);
    }

    if (plot) {
      result = result.filter(crop => crop.plot === plot);
    }

    setFilteredCrops(result);
  };

  const handleFilterButtonClick = () => {
    setShowFilterDropdown(prev => !prev);
  };

  const handleApplyFilter = () => {
    applyFilters(searchTerm, filterGrowthStage, filterPlot);
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this crop?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`http://localhost:5000/crops/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      toast.success("Crop deleted successfully!");
      setCrops(prev => prev.filter(crop => crop._id !== id));
      setFilteredCrops(prev => prev.filter(crop => crop._id !== id));
    } else {
      throw new Error();
    }

  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete crop. Reverting...");
    refreshCrops(); // Reload original data from backend
  }
};


  // Refresh crops list
  const refreshCrops = () => {
    setLoading(true);
    fetchHandler().then((data) => {
      const cropData = Array.isArray(data) ? data : (data.crops || data || []);
      setCrops(Array.isArray(cropData) ? cropData : []);
      setFilteredCrops(Array.isArray(cropData) ? cropData : []);
      setLoading(false);
    });
  };

  // PDF export (kept from your code)
  const handleExport = () => {
    if (loading || !filteredCrops.length) {
      toast.warn("No crops to export.");
      return;
    }

    const doc = new jsPDF();
    const green = [46, 125, 50];
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text("AgroSphere", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("agrosphere@gmail.com", 20, 28);
    doc.text("AgroSphere, Colombo Rd, Kurunegala", 20, 34);

    doc.setFont("helvetica", "italic");
    doc.text(`${formattedDate}`, 20, 42);
    doc.line(20, 46, 190, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Crop Management - Crops Report", 105, 55, { align: "center" });

    const tableData = filteredCrops.map((crop) => [
      crop.cropLabel || "N/A",
      crop.cropName || "N/A",
      crop.plot || "N/A",
      crop.growthStage || "N/A",
      crop.healthStatus || "N/A",
      crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : "N/A",
      crop.harvestingDate ? new Date(crop.harvestingDate).toLocaleDateString() : "N/A",
      crop.expectedYield ? `${crop.expectedYield} kg` : "N/A"
    ]);

    autoTable(doc, {
      startY: 65,
      head: [
        [
          "Crop Label",
          "Crop Name",
          "Plot",
          "Growth Stage",
          "Health Status",
          "Planting Date",
          "Harvesting Date",
          "Expected Yield"
        ]
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: green,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, 105, 290, { align: "center" });

        doc.setFontSize(8);
        doc.text(`Report generated from AgroSphere Crop Management System - Total Crops: ${filteredCrops.length}`, 105, 285, { align: "center" });
      },
    });

    const today = new Date().toISOString().slice(0, 10);
    doc.save(`AgroSphere_Crops_Report_${today}.pdf`);
    toast.success("Crops report successfully downloaded!");
  };

  const growthStages = crops ? [...new Set(crops.map(c => c.growthStage).filter(Boolean))] : [];
  const plots = crops ? [...new Set(crops.map(c => c.plot).filter(Boolean))] : [];

  if (loading) {
    return (
      <div className="crop-list-page">
        <Nav
          handleExportCropList={handleExport}
          notificationCount={notificationCount}
          onBellClick={() => setShowNotifications(true)}
        />
        {showNotifications && (
          <Notifications
            onClose={() => setShowNotifications(false)}
            onCountChange={setNotificationCount}
          />
        )}
        <div className="crop-list-container" ref={ComponentsRef}>
          <h2 className="crop-title">My Crops</h2>
          <p className="crop-subtitle">Grow with confidence, track with ease.!</p>
          <div>Loading crops...</div>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>AgroSphere | Crop Tracker</title>
      </Helmet>

      <Header />
      <div className="crop-list-page">
        <Nav
          handleExportCropList={handleExport}
          notificationCount={notificationCount}
          onBellClick={() => setShowNotifications(true)}
        />

        {showNotifications && (
          <Notifications
            onClose={() => setShowNotifications(false)}
            onCountChange={setNotificationCount}
          />
        )}

        <div className="crop-list-container" ref={ComponentsRef}>
          <h2 className="crop-title">My Crops</h2>
          <p className="crop-subtitle">Grow with confidence, track with ease.!</p>

          <div className="search-filter-container no-print">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search crops..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="filter-btn-container">
              <button className="filter-btn" onClick={handleFilterButtonClick}>
                &#9881; Filter
              </button>

              {showFilterDropdown && (
                <div className="filter-dropdowns" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <select
                    className="filter-btn"
                    value={filterGrowthStage}
                    onChange={(e) => setFilterGrowthStage(e.target.value)}
                  >
                    <option value="">All Stages</option>
                    {growthStages.map((stage, idx) => (
                      <option key={idx} value={stage}>{stage}</option>
                    ))}
                  </select>

                  <select
                    className="filter-btn"
                    value={filterPlot}
                    onChange={(e) => setFilterPlot(e.target.value)}
                  >
                    <option value="">All Plots</option>
                    {plots.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>

                  <button className="filter-btn" onClick={handleApplyFilter}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <table className="crop-table">
            <thead>
              <tr>
                <th>Crop Label</th>
                <th>Crop Name</th>
                <th>Plot</th>
                <th>Growth Stage</th>
                <th>Health Status</th>
                <th>Planting Date</th>
                <th>Harvesting Date</th>
                <th>Expected Yield</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrops && filteredCrops.length > 0 ? (
                filteredCrops.map((crop, i) => (
                  <Crop
                    key={crop._id || i}
                    crop={crop}
                    onDelete={handleDelete}
                    onUpdateSuccess={refreshCrops} // allow child to trigger refresh after update
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No crops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </div>
      <Footer />
    </div>
  );
}

export default CropList;
