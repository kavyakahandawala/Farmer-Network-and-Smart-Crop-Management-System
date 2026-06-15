import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import './Home.css';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const servicesRef = useRef(null);

  const slides = [
    { image: "/images/d3.jpg", title: 'Smart Farming Solutions', subtitle: 'Revolutionizing agriculture with modern technology and sustainable practices' },
    { image: "/images/d4.jpeg", title: 'Sustainable Agriculture', subtitle: 'Growing healthier crops while protecting our environment for future generations' },
    { image: "/images/d1.jpg", title: 'Expert Agricultural Guidance', subtitle: 'Connect with agricultural experts and get personalized advice for your farming needs' }
  ];

  const qualityData = [
    { percentage: '95.2%', description: 'Farmer Satisfaction Rate' },
    { percentage: '89.7%', description: 'Crop Yield Improvement' },
    { percentage: '92.1%', description: 'Sustainable Farming Adoption' },
    { percentage: '87.3%', description: 'Water Conservation Efficiency' },
    { percentage: '94.8%', description: 'Pest Management Success' },
    { percentage: '91.5%', description: 'Soil Health Improvement' }
  ];

  const services = [
    { title: 'CROP CONSULTATION', description: 'Get expert advice on crop selection, planting, and harvesting.', icon: '🌱', path: '/cropList' },
    { title: 'MARKET PRICES', description: 'Live market prices and selling opportunities.', icon: '📈', path: '/user_view' },
    { title: 'CROP INPUTS', description: 'Input or purchase modern farming crops.', icon: '🚜', path: '/product' },
    { title: 'AGRICULTURAL BLOG', description: 'Real-time question updates and farming practices.', icon: '🌤️', path: '/posts' },
    { title: 'FARMING QUESTIONS', description: 'Learn sustainable and organic farming practices.', icon: '🌿', path: '/forum' },
    { 
      title: 'Feedback', 
      description: '📝 Share your thoughts and help us improve your AgroSphere experience.', 
      icon: '💬', 
      path: '/feedback' 
    },
    { 
      title: 'About Us', 
      description: '🌾 Discover our mission to empower farmers with smart agriculture.', 
      icon: '🤝', 
      path: '/about' 
    },
    { 
      title: 'Contact Us', 
      description: '📞 Get in touch with our team for support or inquiries.', 
      icon: '📬', 
      path: '/contact' 
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate-in'); });
    }, observerOptions);
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  const handleServiceClick = path => navigate(path);

  return (
    <>
      <Helmet><title>AgroSphere | Home</title></Helmet>
      <Header />
      {/* Wrap all content in page-content to offset header */}
      <div className="page-content">
        <div className="home-container">
          {/* Slideshow */}
          <section className="slideshow-container">
            {slides.map((slide, index) => (
              <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="slide-overlay">
                  <div className="slide-content">
                    <h2>{slide.title}</h2>
                    <p>{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button key={index} className={`indicator ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} />
              ))}
            </div>
          </section>

          {/* Hero */}
          <section id="home" className="hero animate-on-scroll" ref={heroRef}>
            <div className="hero-content">
              <h1>Transform Your Farming with Smart Agriculture</h1>
              <p>Join thousands of farmers who are increasing their yields and profits with our innovative agricultural solutions and expert guidance.</p>
              <button className="cta-button" onClick={() => navigate('/login')}>Get Started Today</button>
            </div>
          </section>

          {/* Quality Data */}
          <section className="quality-data animate-on-scroll" ref={statsRef}>
            <div className="container">
              <h2>Our Impact on Agriculture</h2>
              <div className="data-grid">
                {qualityData.map((data, index) => (
                  <div key={index} className="data-card">
                    <span className="percentage">{data.percentage}</span>
                    <span className="description">{data.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section id="services" className="grid-section animate-on-scroll" ref={servicesRef} style={{ background: `linear-gradient(rgba(45,80,22,0.05), rgba(74,124,89,0.05)), url("/images/d6.jpg") no-repeat center center/cover` }}>
            <div className="container">
              <div className="grid-header">
                <h2>Comprehensive Agricultural Services</h2>
                <p>Everything you need for successful farming in one place</p>
              </div>
              <div className="services-grid">
                {services.map((service, index) => (
                  <div key={index} className="service-card" onClick={() => handleServiceClick(service.path)}>
                    <div className="service-icon">{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="additional-section animate-on-scroll">
            <div className="container">
              <div className="content-wrapper">
                <div className="left-side">
                  <h2>Why Farmers Choose AgroSphere</h2>
                  <p>At AgroSphere, we're committed to revolutionizing agriculture through technology and expertise. Our platform combines cutting-edge AI, real-time data analytics, and decades of agricultural knowledge to help farmers maximize their yields while maintaining sustainable practices.</p>
                  <div className="features-list">
                    {['24/7 Expert Agricultural Support', 'AI-Powered Crop Monitoring', 'Sustainable Farming Solutions', 'Market Price Intelligence'].map((f, i) => (
                      <div key={i} className="feature-item"><i className="fas fa-check-circle"></i><span>{f}</span></div>
                    ))}
                  </div>
                  <button className="learn-more-btn" onClick={() => navigate('/about')}>Learn More About Us</button>
                </div>
                <div className="right-side">
                  <img src="/images/chooseUs.png" alt="Modern Farming Technology" className="feature-image" />
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="newsletter-section animate-on-scroll">
            <div className="container">
              <div className="newsletter-content">
                <h2>Stay Updated with Agricultural Insights</h2>
                <p>Get the latest farming tips, weather updates, and market trends delivered to your inbox.</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email address" className="newsletter-input" />
                  <button className="newsletter-btn">Subscribe</button>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;
