import React from "react";
import "./ContactUs.css";
import { Helmet } from "react-helmet";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import contactImg from "./Contact.jpg";

export default function ContactUs() {
  return (
    <>
    <Helmet>
        <title>AgroSphere | Contact Us</title>
    </Helmet>

    <Header />
    <div className="contact-page">
      {/* Hero / Banner Section */}
      <div className="contact-hero">
        <img src={contactImg} alt="Contact Banner" className="hero-image" />
        <div className="hero-text">
          <h1>Get in Touch</h1>
          <p>We’d love to hear from you! Here’s how you can reach us.</p>
        </div>
      </div>

      {/* Contact Cards Section */}
      <div className="contact-cards">
        <div className="contact-card">
          <div className="card-icon">📞</div>
          <h3>Phone</h3>
          <p className="contact-dis">A friendly voice is just a call away</p>
          <p className="contact-detail" onClick={() => navigator.clipboard.writeText("+94 77 123 4567")}>
            <strong>+94 77 123 4567</strong>
          </p>
          <span className="copy-tip">(Click to copy)</span>
        </div>

        <div className="contact-card">
          <div className="card-icon">📧</div>
          <h3>Email</h3>
          <p className="contact-dis">Write to us — we love hearing from you</p>
          <p className="contact-detail" onClick={() => navigator.clipboard.writeText("info@agrosphere.com")}>
            <strong>info@agrosphere.com</strong>
          </p>
          <span className="copy-tip">(Click to copy)</span>
        </div>

        <div className="contact-card">
          <div className="card-icon">📍</div>
          <h3>Address</h3>
          <p className="contact-dis">Our doors are always open for fellow growers</p>
          <p className="contact-detail" onClick={() => navigator.clipboard.writeText("AgroSphere HQ, Colombo, Sri Lanka")}>
            <strong>AgroSphere HQ, Colombo, Sri Lanka</strong>
          </p>
          <span className="copy-tip">(Click to copy)</span>
        </div>
      </div>
    <Footer />
    </div>
    </>
  );
}
