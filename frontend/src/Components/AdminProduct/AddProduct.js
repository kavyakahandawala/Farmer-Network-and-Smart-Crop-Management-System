// AddProduct.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AddProduct.css'; // Ensure the CSS file is in the same directory
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Helmet} from "react-helmet";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productname: '',
    category: '',
    quantity: '',
    price: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${id}`);
          console.log('Fetched product:', response.data);
          const product = response.data;
          setFormData({
            productname: product.productname,
            category: product.category,
            quantity: product.quantity,
            price: product.price,
            description: product.description || ''
          });
          if (product.image) {
            setImagePreview(product.image);
          }
        } catch (error) {
          console.error('Error fetching product:', error.response?.data, error.response?.status);
          setError(`Error fetching product: ${error.response?.data?.message || error.message}`);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }
    for (let [key, value] of data.entries()) {
      console.log(`FormData ${key}:`, value);
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      let response;
      if (isEdit) {
        response = await axios.put(`http://localhost:5000/api/products/${id}`, data, config);
        console.log('Product updated:', response.data);
        alert('Product updated successfully!');
      } else {
        response = await axios.post('http://localhost:5000/api/products', data, config);
        console.log('Product added:', response.data);
        alert('Product added successfully!');
      }
      setFormData({ productname: '', category: '', quantity: '', price: '', description: '' });
      setImage(null);
      setImagePreview('');
      setError(null);
      window.dispatchEvent(new Event('productAdded'));
      navigate('/admin/productable');
    } catch (error) {
      console.error('Error:', error.response?.data, error.response?.status);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <>
        <Helmet>
          <title>AgroSphere | Add Product </title>
        </Helmet>
    <div>
      <Header/>
    <div className="add-product-page">
      <header className="add-product-header">
        <h1 className="add-product-title">AgroSphere Admin - {isEdit ? 'Update Product' : 'Add New Product'}</h1>
      </header>
      <div className="add-product-container">
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="productname" className="form-label">Product Name:</label>
            <input
              type="text"
              id="productname"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g., Fertilizer A"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category" className="form-label">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              <option value="seeds">Seeds</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="tools">Tools</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity Available:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              required
              min="1"
              placeholder="e.g., 100"
            />
          </div>
          <div className="form-group">
            <label htmlFor="price" className="form-label">Price per Unit:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              required
              step="0.01"
              placeholder="e.g., 10.00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Brief description..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="image" className="form-label">Product Image:</label>
            {imagePreview && (
              <img src={imagePreview} alt="Product preview" className="image-preview" />
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              className="form-file-input"
              accept="image/*"
            />
          </div>
          <button type="submit" className="form-button">
            {isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
    <Footer/>
    </div>
    </>
  );
};

export default AddProduct;