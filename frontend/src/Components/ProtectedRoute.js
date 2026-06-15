import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ correct for jwt-decode v3+

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token); // ✅ decode token
    const currentTime = Date.now() / 1000;

    // ✅ Token expired
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // ✅ Role-based restriction
    if (role) {
      if (Array.isArray(role) && !role.includes(decoded.role)) {
        return <Navigate to="/login" replace />;
      }
      if (typeof role === "string" && decoded.role !== role) {
        return <Navigate to="/login" replace />;
      }
    }

    return children; // ✅ access granted
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
