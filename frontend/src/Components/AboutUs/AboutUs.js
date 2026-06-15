import React from "react";
import "./AboutUs.css";
import { Helmet } from "react-helmet";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>AgroSphere | About Us</title>
      </Helmet>

      <Header />

      <div className="aboutus-container">
        {/* About Section */}
        <div className="about-section">
          <div className="about-image">
            <img src="images/about.webp" alt="Farm Banner" />
          </div>
          <div className="about-text">
            <h1 className="header1">About Us</h1>
            <p className="para">
              Welcome to <b>AgroSphere</b> — where innovation meets cultivation! 🌱
              <br />
              <br />
              Founded in 2018, AgroSphere is a modern agricultural solutions
              provider dedicated to empowering farmers, agribusinesses, and
              communities with sustainable farming practices and cutting-edge
              technology.
              <br />
              <br />
              Our mission is to make agriculture smarter, more efficient, and
              environmentally friendly. From high-quality seeds and fertilizers to
              smart irrigation and precision farming tools, we help shape the
              future of food production.
              <br />
              <br />
              At AgroSphere, we believe that farming is more than an occupation —
              it’s the foundation of life. We strive to bridge traditional wisdom
              with modern innovation to ensure a greener and more prosperous
              world.
            </p>
          </div>
        </div>

        {/* Vision, Mission, Values Section */}
        <div className="mvv-section">
          {/* Mission */}
          <div className="mvv-card">
            <div className="icon-wrapper">
              <svg
                className="mvv-icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="35" fill="none" stroke="#3CB371" strokeWidth="3" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#3CB371" strokeWidth="3" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="#3CB371" strokeWidth="3" />
                <circle cx="50" cy="50" r="6" fill="#3CB371" />
                <path d="M50 15 L55 25 L50 50 L45 25 Z" fill="#3CB371" />
              </svg>
            </div>
            <h3 className="mvv-title">
              OUR <span className="highlight">MISSION</span>
            </h3>
            <div className="divider"></div>
            <p className="mvv-description">
              Agrosphere aims to transform the agricultural landscape through
              smart solutions, reliable partnerships, and a commitment to
              sustainability and community development.
            </p>
          </div>

          {/* Vision */}
          <div className="mvv-card">
            <div className="icon-wrapper">
              <svg
                className="mvv-icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="45" r="20" fill="#3CB371" />
                <rect x="43" y="65" width="14" height="8" fill="#3CB371" />
                <rect x="45" y="73" width="10" height="5" rx="2" fill="#3CB371" />
                <line x1="50" y1="15" x2="50" y2="5" stroke="#3CB371" strokeWidth="3" />
                <line x1="73" y1="25" x2="82" y2="16" stroke="#3CB371" strokeWidth="3" />
                <line x1="27" y1="25" x2="18" y2="16" stroke="#3CB371" strokeWidth="3" />
                <line x1="75" y1="45" x2="85" y2="45" stroke="#3CB371" strokeWidth="3" />
                <line x1="25" y1="45" x2="15" y2="45" stroke="#3CB371" strokeWidth="3" />
              </svg>
            </div>
            <h3 className="mvv-title">
              OUR <span className="highlight">VISION</span>
            </h3>
            <div className="divider"></div>
            <p className="mvv-description">
              To be a global leader in sustainable agriculture, empowering every
              farmer with innovation and resources to grow efficiently and
              responsibly.
            </p>
          </div>

          {/* Values */}
          <div className="mvv-card">
            <div className="icon-wrapper">
              <svg
                className="mvv-icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 60 Q30 50 35 45 L45 45 L45 35 Q45 30 50 30 Q55 30 55 35 L55 45 L65 45 Q70 50 70 60 L70 75 Q70 80 65 80 L35 80 Q30 80 30 75 Z"
                  fill="#3CB371"
                />
                <polygon
                  points="50,15 53,23 62,23 55,28 58,36 50,31 42,36 45,28 38,23 47,23"
                  fill="#7ddf90"
                />
              </svg>
            </div>
            <h3 className="mvv-title">
              OUR <span className="highlight">VALUES</span>
            </h3>
            <div className="divider"></div>
            <p className="mvv-description">
              Sustainability • Integrity • Innovation • Community Empowerment
            </p>
          </div>
        </div>

        {/* Partners */}
        <div className="brands-heading">
          <div className="line"></div>
          <div className="brands-text">Our Partners</div>
          <div className="line"></div>
        </div>

        <div className="brands">
          <img src="images/brand1.png" alt="brand1" />
          <img src="images/brand2.png" alt="brand2" />
          <img src="images/brand3.png" alt="brand3" />
          <img src="images/brand4.png" alt="brand4" />
          <img src="images/brand6.png" alt="brand6" />
          <img src="images/brand7.png" alt="brand7" />
          <img src="images/brand9.png" alt="brand9" />
          <img src="images/brand10.png" alt="brand10" />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
