import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductDisplay.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import {Helmet} from "react-helmet";

const ProductDisplay = ({ tempOrder, setTempOrder }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        params: { search, category, sort },
      });
      setProducts(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      setError('Failed to load products: ' + (error.response?.data?.message || error.message));
      setProducts([]);
    }
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
    const handleProductAdded = () => fetchProducts();
    window.addEventListener('productAdded', handleProductAdded);
    return () => window.removeEventListener('productAdded', handleProductAdded);
  }, [fetchProducts]);

  const handleQuantityChange = (productId, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const addToOrder = (product) => {
    const quantity = quantities[product._id] || 1;
    const existingItem = tempOrder.find(item => item.productId === product._id);

    if (existingItem) {
      setTempOrder(tempOrder.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setTempOrder([...tempOrder, {
        productId: product._id,
        quantity,
        productname: product.productname,
        price: product.price
      }]);
    }

    alert(`${quantity} ${product.productname}(s) added to order!`);
    setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
  };

  return (
    <>
    <Helmet>
      <title>AgroSphere | Products</title>
    </Helmet>
    <div className="product-page-wrapper">
      <Header />
      <div className="product-page">
        <header className="banner">
          <img className="banner-img" src="/images/cropinput.jpeg" alt="Banner Image" />
          <div className="banner-overlay"></div>
          <h1>🌱 AgroSphere - Crop Inputs 🌾</h1>
        </header>
        <div className="container">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Filter by Category</option>
              <option value="seeds">Seeds</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="tools">Tools</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort by Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
            <button className="view-order" onClick={() => navigate('/order')}>
              🛒 View Order ({tempOrder.length})
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          {products.length === 0 && !error ? (
            <p className="no-products">No products available</p>
          ) : (
            <div className="grid">
              {products.map((product, index) => (
                <div key={product._id} className="product-card" style={{ animationDelay: `${index * 0.15}s` }}>
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.productname}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  <h3>{product.productname}</h3>
                  <p className="desc">{product.description}</p>
                  <p className="price">Rs {product.price} / unit</p>
                  <div className="quantity-box">
                    <label>Qty:</label>
                    <input
                      type="number"
                      value={quantities[product._id] || 1}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <button className="add-btn" onClick={() => addToOrder(product)}>
                    ➕ Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default ProductDisplay;