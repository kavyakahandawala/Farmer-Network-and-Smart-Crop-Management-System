import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/cropList", label: "Crop" },
    { path: "/user_view", label: "Market Price" },
    { path: "/product", label: "Products" },
    { path: "/posts", label: "Blog" },
  ];

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      {/* Decorative Background */}
      <div className="header-bg-decoration">
        <div className="floating-leaf leaf-1">🍃</div>
        <div className="floating-leaf leaf-2">🌿</div>
        <div className="floating-leaf leaf-3">🍀</div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <nav className="navbar">
        {/* Logo */}
        <div className="logo_box" onClick={() => navigate("/")}>
          <div className="logo-ring"></div>
          <img src="/images/logonew.png" alt="AgroSphere Logo" />
          <div className="logo-pulse"></div>
        </div>

        {/* Navigation Links */}
        <ul className={`nav_links ${isMenuOpen ? "active" : ""}`}>
          {navItems.map((item, index) => (
            <li key={item.path} style={{ "--item-index": index }}>
              <Link
                to={item.path}
                className={activeSection === item.path ? "active-link" : ""}
                onClick={() => {
                  setActiveSection(item.path);
                  setIsMenuOpen(false);
                }}
              >
                <span className="nav-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile Icon (Right Corner) */}
        <div className="profile-icon" onClick={() => navigate("/login")}>
          <div className="icon-glow"></div>
          <img src="/images/user.jpg" alt="Login" title="Login" />
          <div className="icon-ripple"></div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="menu-line line-1"></span>
          <span className="menu-line line-2"></span>
          <span className="menu-line line-3"></span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
