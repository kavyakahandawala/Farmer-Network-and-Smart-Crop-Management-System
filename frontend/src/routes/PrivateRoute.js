import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />; // not logged in

  try {
    const decoded = jwt_decode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.clear();
      return <Navigate to="/login" />; // token expired
    }
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" />; // invalid token
  }

  return children; // allowed
};

export default PrivateRoute;
