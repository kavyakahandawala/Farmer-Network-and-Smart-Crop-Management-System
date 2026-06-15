import React, { useState } from 'react';
import API from '../axios';

function AddUser() {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    district: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Validation functions for each field
  const validators = {
    fullName: (value) => /^[a-zA-Z\s]{7,}$/.test(value) ? '' : 'Full Name must contain only letters and spaces',
    age: (value) => (value && !isNaN(value) && value >= 18 && value <= 100) ? '' : 'Age must be between 18 and 100',
    gender: (value) => value ? '' : 'Gender is required',
    address: (value) => value.trim() ? '' : 'Address is required',
    phone: (value) => /^\d{10}$/.test(value) ? '' : 'Phone must be a 10-digit number',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email',
    username: (value) => /^[a-zA-Z0-9_]{4,20}$/.test(value) ? '' : 'Username 4-20 chars, letters/numbers/_ only',
    password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&]).{8,}$/.test(value) ? '' : 'Password must be 8+ chars with uppercase, lowercase, number & special char',
    district: (value) => value.trim() ? '' : 'District is required',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validators[field](formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await API.post('/users/register', formData);
      setMessageType('success');
      setMessage(res.data.message);
      setFormData({
        fullName: '',
        age: '',
        gender: '',
        address: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        district: '',
      });
      setErrors({});
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Error adding user ❌');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '30px',
        borderRadius: '15px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#2E7D32',
          fontSize: '2rem',
          marginBottom: '25px',
          fontWeight: '600',
        }}>
          👤 Add New User
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {Object.keys(formData).map((field) => (
            field !== 'gender' ? (
              <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#388E3C', fontWeight: '500', textTransform: 'capitalize' }}>
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={field === 'password' ? 'password' : field === 'age' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                  style={{
                    padding: '12px',
                    border: `2px solid ${errors[field] ? '#D32F2F' : '#81C784'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
                  onBlur={(e) => (e.target.style.borderColor = errors[field] ? '#D32F2F' : '#81C784')}
                />
                {errors[field] && <span style={{ color: '#D32F2F', fontSize: '0.85rem' }}>{errors[field]}</span>}
              </div>
            ) : (
              <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#388E3C', fontWeight: '500' }}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    padding: '12px',
                    border: `2px solid ${errors[field] ? '#D32F2F' : '#81C784'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '1rem',
                    backgroundColor: '#fff',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
                  onBlur={(e) => (e.target.style.borderColor = errors[field] ? '#D32F2F' : '#81C784')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors[field] && <span style={{ color: '#D32F2F', fontSize: '0.85rem' }}>{errors[field]}</span>}
              </div>
            )
          ))}

          <button
            type="submit"
            style={{
              padding: '14px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#388E3C')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
          >
            Add User
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '500',
            color: messageType === 'success' ? '#155724' : '#D32F2F',
            backgroundColor: messageType === 'success' ? '#D4EDDA' : '#FFEBEE',
            border: messageType === 'success' ? '1px solid #C3E6CB' : '1px solid #F5C6CB',
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default AddUser;
