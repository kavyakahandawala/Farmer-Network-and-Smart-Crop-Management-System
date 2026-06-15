// frontend/src/components/landService.js
import API from "../../axios";

// Add new land
export const addLand = async (formData, isAdmin = false) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };

  // Farmer posts to /lands, admin posts to /lands/admin
  const endpoint = isAdmin ? "/lands/admin" : "/lands";
  const response = await API.post(endpoint, formData, config);
  return response.data;
};

// Get lands for logged-in farmer
export const getMyLands = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await API.get("/lands/farmer/me", config);
  return response.data;
};

// Admin can fetch a farmer's lands
export const getLandsByFarmer = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await API.get(`/lands/farmer/${userId}`, config);
  return response.data;
};

// Update land
export const updateLand = async (landId, formData, isAdmin = false) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };

  const endpoint = isAdmin ? `/lands/admin/${landId}` : `/lands/${landId}`;
  const response = await API.put(endpoint, formData, config);
  return response.data;
};

// Delete land
export const deleteLand = async (landId, isAdmin = false) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  const config = { headers: { Authorization: `Bearer ${token}` } };
  const endpoint = isAdmin ? `/lands/admin/${landId}` : `/lands/${landId}`;
  const response = await API.delete(endpoint, config);
  return response.data;
};
