import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ for v4

function SessionTimer() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      const updateTimer = () => {
        const now = Date.now() / 1000;
        const remaining = Math.max(0, Math.floor(decoded.exp - now));

        if (remaining <= 0) {
          localStorage.clear();
          navigate("/login");
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // ✅ No JSX returned, so nothing is visible
  return null;
}

export default SessionTimer;
