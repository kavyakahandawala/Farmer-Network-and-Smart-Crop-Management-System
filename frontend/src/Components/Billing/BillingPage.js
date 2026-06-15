import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaHome, FaCity, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './BillingPage.css';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Helmet} from "react-helmet";

const BillingPage = ({ tempOrder, setTempOrder }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    country: '',
    street: '',
    city: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { billingId, tempOrder: tempOrderFromLocation, isNewBilling } = location.state || {};

  // (⚡functions remain unchanged...)

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        else if (value.trim().length < 2) newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        else if (value.length > 50) newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`;
        else if (!/^[A-Za-z\s]+$/.test(value)) newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters and spaces`;
        else delete newErrors[name];
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Please enter a valid email address';
        else if (value.length > 100) newErrors.email = 'Email must be less than 100 characters';
        else delete newErrors.email;
        break;
      case 'contactNumber':
        if (!value.trim()) newErrors.contactNumber = 'Contact number is required';
        else if (!/^\d{10}$/.test(value)) newErrors.contactNumber = 'Contact number must be exactly 10 digits';
        else delete newErrors.contactNumber;
        break;
      case 'country':
      case 'street':
      case 'city':
        if (!value.trim()) newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        else if (value.trim().length < 2) newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
        else if (value.length > 100) newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than 100 characters`;
        else delete newErrors[name];
        break;
      default:
        break;
    }
    return newErrors;
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.contactNumber.trim() &&
      formData.country.trim() &&
      formData.street.trim() &&
      formData.city.trim() &&
      Object.keys(errors).length === 0
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(validateField(name, value));
  };

  useEffect(() => {
    if (tempOrderFromLocation && tempOrderFromLocation.length > 0) {
      setTempOrder(tempOrderFromLocation);
    }

    if (billingId && !isNewBilling) {
      const fetchBilling = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/billing/${billingId}`);
          const { firstName, lastName, email, contactNumber, country, street, city } = response.data.billing;
          const newFormData = { firstName, lastName, email, contactNumber, country, street, city };
          setFormData(newFormData);
          Object.entries(newFormData).forEach(([name, value]) => {
            setErrors((prev) => validateField(name, value));
          });
        } catch (error) {
          setErrors({ general: 'Failed to fetch billing details: ' + (error.response?.data?.message || error.message) });
        } finally {
          setLoading(false);
        }
      };
      fetchBilling();
    }
  }, [billingId, isNewBilling, tempOrderFromLocation, setTempOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    const newErrors = Object.entries(formData).reduce((acc, [name, value]) => {
      return { ...acc, ...validateField(name, value) };
    }, {});
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const billingData = { ...formData };

    try {
      setLoading(true);
      let response;
      if (billingId && !isNewBilling) {
        response = await axios.put(`/api/billing/${billingId}`, billingData);
      } else {
        response = await axios.post('/api/billing', billingData);
      }
      setSuccessMessage(billingId && !isNewBilling ? 'Billing information updated successfully!' : 'Billing information added successfully!');
      setTimeout(() => {
        navigate('/order', { state: { billingId: response.data.billing._id, tempOrder } });
      }, 1500);
    } catch (error) {
      setErrors({ general: 'Error submitting billing: ' + (error.response?.data?.message || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOrder = () => {
    navigate('/order', { state: { tempOrder } });
  };

  return (
    <>
        <Helmet>
          <title>AgroSphere | Billing </title>
        </Helmet>
    <div>
      <Header/>
    <div className="billing-page">
      {/* Banner with title */}
      <div className="billing-banner">
        <h1>AgroSphere - Billing Information</h1>
        <p className="subtitle">Please provide your billing details to proceed with your order</p>
      </div>

      <div className="container fade-in">
        {loading && (
          <div className="loading-container">
            <span className="loading-spinner"></span>
            <p className="text-loading">Loading...</p>
          </div>
        )}
        {errors.general && <p className="text-error">{errors.general}</p>}
        {successMessage && (
          <p className="text-success"><FaCheckCircle /> {successMessage}</p>
        )}

        <button className="bg-primary back-button" onClick={handleBackToOrder} type="button">
          <FaArrowLeft /> Back to Order
        </button>

        <form onSubmit={handleSubmit} className="form slide-up">
          <h2>{billingId && !isNewBilling ? 'Update Billing Information' : 'Add Billing Information'}</h2>
          <div className="form-grid">
            {/* Input with icons */}
            <div className="form-group">
              <label htmlFor="firstName"><FaUser /> First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName}
                onChange={handleChange} placeholder="Enter first name"
                className={errors.firstName ? 'border-error' : ''} />
              {errors.firstName && <p className="error-message">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName"><FaUser /> Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName}
                onChange={handleChange} placeholder="Enter last name"
                className={errors.lastName ? 'border-error' : ''} />
              {errors.lastName && <p className="error-message">{errors.lastName}</p>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="email"><FaEnvelope /> Email</label>
              <input type="email" id="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter email address"
                className={errors.email ? 'border-error' : ''} />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="contactNumber"><FaPhone /> Contact Number</label>
              <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber}
                onChange={handleChange} placeholder="Enter 10-digit contact number"
                className={errors.contactNumber ? 'border-error' : ''} />
              {errors.contactNumber && <p className="error-message">{errors.contactNumber}</p>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="country"><FaGlobe /> Country</label>
              <input type="text" id="country" name="country" value={formData.country}
                onChange={handleChange} placeholder="Enter country"
                className={errors.country ? 'border-error' : ''} />
              {errors.country && <p className="error-message">{errors.country}</p>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="street"><FaHome /> Street</label>
              <input type="text" id="street" name="street" value={formData.street}
                onChange={handleChange} placeholder="Enter street address"
                className={errors.street ? 'border-error' : ''} />
              {errors.street && <p className="error-message">{errors.street}</p>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="city"><FaCity /> City</label>
              <input type="text" id="city" name="city" value={formData.city}
                onChange={handleChange} placeholder="Enter city"
                className={errors.city ? 'border-error' : ''} />
              {errors.city && <p className="error-message">{errors.city}</p>}
            </div>
          </div>
          <button type="submit" className="bg-success submit-button" disabled={loading || !isFormValid()}>
            {loading ? <span className="loading-spinner"></span> : (billingId && !isNewBilling ? 'Update Billing' : 'Submit Billing')}
          </button>
        </form>
      </div>
    </div>
    <Footer/>
    </div>
    </>
  );
};

export default BillingPage;
