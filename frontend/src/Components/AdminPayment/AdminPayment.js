import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './AdminPayment.css';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Helmet} from "react-helmet";

function AdminPayment() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('orderId');
  const [filterMethod, setFilterMethod] = useState('');
  const navigate = useNavigate();

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/payment', {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        });
        setPayments(response.data.payments);
      } catch (error) {
        let errorMessage = 'Failed to fetch payments: ';
        if (error.code === 'ECONNABORTED') {
          errorMessage += 'Connection timed out. Please check if the backend is running.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage += 'Network error. Please check your internet connection.';
        } else if (error.response?.status === 404) {
          errorMessage += 'Payments endpoint not found.';
        } else {
          errorMessage += error.response?.data?.message || error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Chart
  useEffect(() => {
    const ctx = document.getElementById('paymentStatusChart')?.getContext('2d');
    if (!ctx) return;

    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Payment Status Distribution',
        data: Object.values(statusCounts),
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      }],
    };

    const chart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.2,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              color: '#ffffff', 
              font: { size: 12, weight: 'bold' },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            } 
          },
          title: { 
            display: true, 
            text: 'Payment Status Distribution', 
            color: '#ffffff', 
            font: { size: 18, weight: 'bold' } 
          },
          tooltip: {
            bodyColor: '#fff',
            backgroundColor: '#34495e',
            titleColor: '#fff',
          },
        },
      },
    });

    return () => chart.destroy();
  }, [payments]);

  // Handlers
  const handleVerifyPayment = async (paymentId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/payment/verify/${paymentId}`, {}, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      setPayments(payments.map(p => p._id === paymentId ? response.data.payment : p));
      await axios.post('/api/notifications', {
        userId: response.data.payment.billingId?.userId || 'admin',
        message: `Payment for order ${response.data.payment.orderId} has been verified.`,
      });
      setError(null);
    } catch (error) {
      setError('Error verifying payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUnverifyPayment = async (paymentId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/payment/unverify/${paymentId}`, {}, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      setPayments(payments.map(p => p._id === paymentId ? response.data.payment : p));
      await axios.post('/api/notifications', {
        userId: response.data.payment.billingId?.userId || 'admin',
        message: `Payment for order ${response.data.payment.orderId} has been unverified.`,
      });
      setError(null);
    } catch (error) {
      setError('Error unverifying payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchOrder = async (paymentId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/payment/dispatch/${paymentId}`, {}, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
      setPayments(payments.filter(p => p._id !== paymentId));
      setError(null);
    } catch (error) {
      setError('Error dispatching order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Sorting + Filtering
  const sortedPayments = [...payments]
    .filter(payment => !payment.isDispatched)
    .sort((a, b) => {
      if (sortBy === 'orderId') return a.orderId.localeCompare(b.orderId);
      if (sortBy === 'totalAmount') return a.totalAmount - b.totalAmount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    })
    .filter(payment => filterMethod ? payment.paymentMethod === filterMethod : true);

  return (
    <>
      <Helmet>
        <title>AgroSphere | Payment Handling </title>
      </Helmet>
      <div className="admin-payment-page">
        <Header />
        <div className="min-h-screen">
          <header className="admin-payment-header">
            <h1>💳 AgroSphere - Payment Dashboard 💰</h1>
          </header>
          <div className="container">
            {loading && <p className="text-loading">Loading payments...</p>}
            {error && <p className="text-error">{error}</p>}

            <div className="button-group">
              <button className="back-button" onClick={() => navigate('/admin')}>
                Back to Admin Dashboard
              </button>
            </div>

            <div className="chart-container">
              <h3>📊 Payment Status Overview</h3>
              <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <canvas id="paymentStatusChart" style={{ maxWidth: '300px', maxHeight: '300px' }}></canvas>
              </div>
            </div>

            <div className="button-group">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="orderId">Sort by Order ID</option>
                <option value="totalAmount">Sort by Total Amount</option>
                <option value="status">Sort by Status</option>
              </select>
              <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                <option value="">All Payment Methods</option>
                <option value="slip">Slip</option>
                <option value="card">Card</option>
              </select>
            </div>

            <h2 style={{ color: 'var(--primary-green)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
              💳 Payment Summaries
            </h2>

            {sortedPayments.length === 0 ? (
              <div className="no-payments">No payments found</div>
            ) : (
              <div className="payment-cards-container">
                {sortedPayments.map((payment, index) => (
                  <div key={payment._id} className="payment-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="payment-card-header">
                      <div className="payment-id">Order #{payment.orderId}</div>
                      <div className={`payment-status status-${payment.status}`}>
                        {payment.status === 'completed' ? '✅ Completed' : 
                         payment.status === 'unverified' ? '⏳ Pending' : '❌ Failed'}
                      </div>
                    </div>

                    <div className="payment-details">
                      <div className="payment-detail">
                        <div className="payment-detail-label">Payment Date</div>
                        <div className="payment-detail-value">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="payment-detail">
                        <div className="payment-detail-label">Payment Method</div>
                        <div className="payment-detail-value">
                          {payment.paymentMethod === 'slip' ? '📄 Bank Slip' : '💳 Credit Card'}
                        </div>
                      </div>
                      <div className="payment-detail">
                        <div className="payment-detail-label">Dispatched</div>
                        <div className="payment-detail-value">
                          {payment.isDispatched ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                      <div className="payment-detail">
                        <div className="payment-detail-label">Items Count</div>
                        <div className="payment-detail-value">
                          {payment.orderItems ? payment.orderItems.length : 0} items
                        </div>
                      </div>
                    </div>

                    <div className="payment-amount">
                      Rs {payment.totalAmount ? payment.totalAmount.toFixed(2) : '0.00'}
                    </div>

                    {payment.paymentMethod === 'slip' && payment.paymentSlip && (
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <img
                          src={`http://localhost:5000${payment.paymentSlip}`}
                          alt="Payment Slip"
                          style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                          onError={(e) => {
                            e.target.alt = 'Payment slip unavailable';
                            e.target.src = 'https://via.placeholder.com/300x200?text=Payment+Slip+Unavailable';
                          }}
                        />
                      </div>
                    )}

                    {payment.paymentMethod === 'card' && payment.cardDetails && (
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--beige)', borderRadius: '8px' }}>
                        <div className="payment-detail">
                          <div className="payment-detail-label">Card Number</div>
                          <div className="payment-detail-value">**** **** **** {payment.cardDetails.cardNumber?.slice(-4)}</div>
                        </div>
                        <div className="payment-detail">
                          <div className="payment-detail-label">Expiry</div>
                          <div className="payment-detail-value">{payment.cardDetails.expMonth}/{payment.cardDetails.expYear}</div>
                        </div>
                      </div>
                    )}

                    {payment.billingId && (
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--beige)', borderRadius: '8px' }}>
                        <div className="payment-detail">
                          <div className="payment-detail-label">Customer</div>
                          <div className="payment-detail-value">{payment.billingId.firstName} {payment.billingId.lastName}</div>
                        </div>
                        <div className="payment-detail">
                          <div className="payment-detail-label">Email</div>
                          <div className="payment-detail-value">{payment.billingId.email}</div>
                        </div>
                        <div className="payment-detail">
                          <div className="payment-detail-label">Phone</div>
                          <div className="payment-detail-value">{payment.billingId.contactNumber}</div>
                        </div>
                      </div>
                    )}

                    <div className="payment-actions">
                      {payment.paymentMethod === 'slip' && payment.status !== 'completed' && (
                        <button className="action-button edit-button" onClick={() => handleVerifyPayment(payment._id)} disabled={loading}>
                          {loading ? 'Verifying...' : '✅ Verify'}
                        </button>
                      )}
                      {payment.paymentMethod === 'slip' && payment.status !== 'unverified' && (
                        <button className="action-button delete-button" onClick={() => handleUnverifyPayment(payment._id)} disabled={loading}>
                          {loading ? 'Unverifying...' : '❌ Unverify'}
                        </button>
                      )}
                      {!payment.isDispatched && (
                        <button className="action-button view-button" onClick={() => handleDispatchOrder(payment._id)} disabled={loading || (payment.paymentMethod === 'slip' && payment.status !== 'completed')}>
                          {loading ? 'Dispatching...' : '🚚 Dispatch'}
                        </button>
                      )}
                    </div>
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
}

export default AdminPayment;