import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

function MapPicker({ coordinates, setCoordinates }) {
  const initialPosition = coordinates
    ? coordinates.split(",").map(Number)
    : [7.8731, 80.7718]; // Default Sri Lanka center

  const [position, setPosition] = useState(initialPosition);

  const MapClick = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setCoordinates(`${lat.toFixed(6)},${lng.toFixed(6)}`);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={7}
      style={{ height: "300px", width: "100%", marginBottom: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <MapClick />
      <Marker position={position} />
    </MapContainer>
  );
}

export default MapPicker;
