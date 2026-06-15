import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation  } from "react-router-dom";
import Home from "./Components/Home/Home"; 
import ContactUs from "./Components/ContactUs/ContactUs";
import QandACreate from "./Components/QandACreate/QandACreate";
import QandAUpdate from "./Components/QandAUpdate/QandAUpdate";
import QandAForm from "./Components/QandAForm/QandAForm";                
import QandAPost from "./Components/QandAPost/QandAPost";               
import QandAPostDisplay from "./Components/QandAPostDisplay/QandAPostDisplay"; 
import QandAPostUpdate from "./Components/QandAPostUpdate/QandAPostUpdate";   
import Admin from "./Components/adminDashboard/adminDashboard"; 
import QandADisplay from "./Components/QandADisplay/QandADisplay"; 
import QandAPostView from "./Components/QandAPostView/QandAPostView";  
import Advisor from "./Components/Advisor/Advisor";  
import AboutUs from "./Components/AboutUs/AboutUs"; 
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";

import CropList from "./Components/CropList/CropList";
import Crop from "./Components/Crop/Crop";
import AddCrop from "./Components/AddCrop/AddCrop";
import CalendarView from "./Components/CalendarView/CalendarView";
import Export from "./Components/Export/Export";
import UpdateCrop from './Components/UpdateCrop/UpdateCrop';
import Nav from "./Components/Nav/Nav";
import Notifications from "./Components/Notifications/Notifications";

import ProductDisplay from './Components/AdminProduct/ProductDisplay';
import AddProduct from './Components/AdminProduct/AddProduct';
import OrderPage from './Components/ProductOrder/OrderPage';
import BillingPage from './Components/Billing/BillingPage';
import AddPaymentPage from './Components/Payment/AddPayment';
import ProductTable from './Components/AdminProduct/ProductTable';
import AdminPaymentPage from './Components/AdminPayment/AdminPayment';

import AdminMarketWM from './Components/MarketWMAdmin/AdminMarketWM';
import MarketWMdetails from './Components/MarketWMdetails/MarketWMdetails';
import AdminUpdateMWM from './Components/AdminUpdateMWM/AdminUpdateMWM';
import UserMarketWMdetails from './Components/UserMarketWMdetails/UserMarketWMdetails';

// Components
import Login from "./Components/Login";
import Register from "./Components/Register";
import AddUser from "./Components/AddUser";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminDashboard from "./Components/AdminDashboard";
import EditUser from "./Components/EditUser";
import UserRoutes from "./routes/UserRoutes";
import UserProfile from "./Components/UserProfile";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import SessionTimer from "./Components/SessionTimer";
import Feedback from "./Components/FeedbackForm";


// Land components
import FarmerLands from "./Components/Land/FarmerLands";
import AdminViewLands from "./Components/Land/AdminViewLands";
import AddLandForm from "./Components/Land/AddLandForm";
import UserLandsPage from "./Components/Land/UserLandsPage"; 

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId"); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  useEffect(() => {
    // You could handle any role-based logic here if needed
  }, []);

  const [tempOrder, setTempOrder] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  console.log('App.js: Rendering routes, tempOrder:', tempOrder);

  // ✅ handle bell click: show overlay + reset red dot
  const handleBellClick = () => {
    setShowNotifications(true);
    setNotificationCount(0); // mark all notifications as read
  };

  // ✅ Only show Nav on crop-related routes
  const showNavPaths = ["/cropList", "/crop", "/addCrop", "/calendarView", "/export"];
  const showNav =
    showNavPaths.some(path => location.pathname.startsWith(path)) ||
    /^\/\d+$/.test(location.pathname);

  return (
    <div>
      {/* Silent session timer */}
      <SessionTimer />

      {/* ✅ Conditional Nav */}
      {showNav && (
        <Nav 
          notificationCount={notificationCount} 
          onBellClick={handleBellClick}
        />
      )}
      
      <Routes>
        {/* ---------- User Routes ---------- */}
        <Route path="/" element={<Home />} />   
        <Route path="/contact" element={<ContactUs />} />      
        <Route path="/forum" element={<QandAForm />} /> 
        <Route path="/post/create" element={<QandAPost />} />
        <Route path="/posts" element={<QandAPostDisplay />} />
        <Route path="/post/update/:id" element={<QandAPostUpdate />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin/qaforum" element={<QandADisplay />} />
        <Route path="/admin/qapost" element={<QandAPostView />} />
        
        {/* ---------- Admin Routes ---------- */}
        <Route
          path="/admin"
          element={<Admin />}
        />
        
        <Route path="/create" element={<QandACreate />} />
        <Route path="/update/:id" element={<QandAUpdate />} />

        <Route path="/cropList" element={<CropList />} />
        <Route path="/crop" element={<Crop />} />
        <Route path="/addCrop" element={<AddCrop />} />
        <Route path="/calendarView" element={<CalendarView />} />
        <Route path="/export" element={<Export />} />
        <Route path="/updatecrop/:id" element={<UpdateCrop />} />


        <Route path="/product" element={<ProductDisplay tempOrder={tempOrder} setTempOrder={setTempOrder} />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/order" element={<OrderPage tempOrder={tempOrder} setTempOrder={setTempOrder} />} />
        <Route path="/billing" element={<BillingPage tempOrder={tempOrder} setTempOrder={setTempOrder} />} />
        <Route path="/add-payment" element={<AddPaymentPage tempOrder={tempOrder} setTempOrder={setTempOrder} />} />
        <Route path="/admin/productable" element={<ProductTable />} />
        <Route path="/admin/edit-product/:id" element={<AddProduct />} />
        <Route path="/admin/payment" element={<AdminPaymentPage/>} />

        <Route path="/marketWatch" element={<MarketWMdetails />} />
        <Route path="/admin/market" element={<AdminMarketWM />} />  
        <Route path="/admin_view" element={<MarketWMdetails />} />
        <Route path="/admin_view/:id" element={<AdminUpdateMWM />} />
        <Route path="/user_view" element={<UserMarketWMdetails />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin */}
        <Route
          path="/add-user"
          element={
            <ProtectedRoute role="admin">
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <ProtectedRoute role="admin">
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId/lands"
          element={
            <ProtectedRoute role="admin">
              <AdminViewLands />
            </ProtectedRoute>
          }
        />

        {/* Farmer/User Lands */}
        <Route
          path="/my-lands"
          element={
            <ProtectedRoute role={["farmer", "admin"]}>
              <FarmerLands userId={userId} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-land"
          element={
            <ProtectedRoute role={["farmer", "admin"]}>
              <AddLandForm />
            </ProtectedRoute>
          }
        />

        {/*  New dynamic lands route */}

        
        <Route
          path="/lands/:userId"
          element={
            <ProtectedRoute role={["farmer", "admin"]}>
              <UserLandsPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute role={["farmer", "admin"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Nested user routes */}
        <Route path="/user/*" element={<UserRoutes />} />

        {/* Dynamic crop update route - must be last */}
        <Route path="/:id" element={<UpdateCrop />} />

        {/* 404 */}
        <Route
          path="*"
          element={<h2 style={{ textAlign: "center" }}>404 - Page Not Found</h2>}
        />
      </Routes>
      {/* Notifications overlay */}
      {showNotifications && (
        <Notifications 
          onClose={() => setShowNotifications(false)}
          onCountChange={setNotificationCount}
        />
      )}
    </div>
  );
}

export default App;