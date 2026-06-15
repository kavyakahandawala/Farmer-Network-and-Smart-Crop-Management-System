import axios from "axios";


const API = axios.create({
  baseURL: "http://localhost:5000", // backend URL
});

// Add Authorization header automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor for handling 401/403 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert("Session expired or admin access required. Please login again.");
      localStorage.removeItem("token"); // optional
      window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;
