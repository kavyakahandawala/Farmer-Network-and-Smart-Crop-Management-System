import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./ProductTable.css"; // Import custom CSS
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Helmet} from "react-helmet";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error.response?.data, error.response?.status);
      setError(`Error fetching products: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleProductAdded = () => {
      fetchProducts();
    };
    window.addEventListener('productAdded', handleProductAdded);
    return () => {
      window.removeEventListener('productAdded', handleProductAdded);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error.response?.data, error.response?.status);
        setError(`Error deleting product: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <>
        <Helmet>
          <title>AgroSphere | Product Summary </title>
        </Helmet>
    <div>
      <Header/>
    <div className="product-page">
      <header className="product-header">
        <h1>AgroSphere Admin - Product Catalog</h1>
      </header>
      <div className="container">
        <div className="button-group">
          <button
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            ← Back to Admin Dashboard
          </button>
          <button
            className="add-product-button"
            onClick={() => navigate('/admin/add-product')}
          >
            Add New Product
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image && (
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.productname}
                        className="product-table-image"
                      />
                    )}
                  </td>
                  <td>{product.productname}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>Rs {product.price}</td>
                  <td>{product.description}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer/>
  </div>
  </>
  );
};

export default ProductTable;