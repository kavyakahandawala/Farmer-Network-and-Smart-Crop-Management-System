import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../Components/ProtectedRoute";
import UserProfile from "../Components/UserProfile"; 

function UserRoutes() {
  return (
    <Routes>
      {/* Profile page (farmer or admin can view/update their own profile) */}
      <Route
        path="profile"
        element={
          <ProtectedRoute role={["farmer", "admin"]}>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Add more user-specific routes here */}
    </Routes>
  );
}

export default UserRoutes;
