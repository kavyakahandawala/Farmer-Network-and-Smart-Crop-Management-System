import React from "react";
import "./UserViewMWM.css";

function UserViewMWM(props) {
  if (!props.market) {
    return (
      <tr>
        <td colSpan="6" className="no-data">No market data available</td>
      </tr>
    );
  }

  const { _id, cropName, marketLocation, pricePerKg, priceDate, TrendIndicator } = props.market;

  return (
    <tr>
      <td>{_id}</td>
      <td>{cropName}</td>
      <td>{marketLocation}</td>
      <td>LKR {pricePerKg.toFixed(2)}</td>
      <td>{new Date(priceDate).toLocaleDateString()}</td>
      <td>{TrendIndicator}</td>
    </tr>
  );
}

export default UserViewMWM;