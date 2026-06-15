import React from "react";
import { useParams } from "react-router-dom";
import FarmerLands from "./FarmerLands";

function AdminViewLands() {
  const { userId } = useParams(); // get farmer ID from URL

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>  </h2>
      <FarmerLands userId={userId} isAdmin={true} />
    </div>
  );
}

export default AdminViewLands;
