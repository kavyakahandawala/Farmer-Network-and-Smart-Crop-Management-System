import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./adminDashboard.css";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { FaUsers, FaTractor, FaStore, FaComments, FaSignOutAlt, FaTachometerAlt, FaQuestionCircle } from "react-icons/fa";

function Admin() {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const storedName = localStorage.getItem("adminName");
    if (storedName) setAdminName(storedName);
  }, []);

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Dashboard</title>
      </Helmet>
       {/* Header */}
      <Header />

      <div className="admin-dashboard-container">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <ul className="admin-menu">
            <li className="admin-active">
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
              <Link to="/admin_view">
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
                href="/"
                onClick={(e) => {
                  if (!window.confirm("Are you sure you want to Logout?")) e.preventDefault();
                }}
              >
                <FaSignOutAlt /> <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main content wrapper */}
        <div className="admin-main">
          {/* Dashboard Overview (cards) */}
          <div className="admin-dashboard-section admin-overview">
            <div className="admin-card">
              <div className="admin-icon"><FaUsers /></div>
              <h3>Total Users</h3>
              <p>120</p>
            </div>
            <div className="admin-card">
              <div className="admin-icon"><FaTractor /></div>
              <h3>Crops Tracked</h3>
              <p>45</p>
            </div>
            <div className="admin-card">
              <div className="admin-icon"><FaStore /></div>
              <h3>Market Listings</h3>
              <p>32</p>
            </div>
            <div className="admin-card">
              <div className="admin-icon"><FaComments /></div>
              <h3>Forum Questions</h3>
              <p>15</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Admin;