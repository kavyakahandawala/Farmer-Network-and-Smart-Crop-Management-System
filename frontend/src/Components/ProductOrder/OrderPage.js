import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OrderPage.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { Helmet } from "react-helmet";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderPage = ({ tempOrder, setTempOrder }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [error, setError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [cardDetailsSaved, setCardDetailsSaved] = useState(false);
  const [billingSummary, setBillingSummary] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedOrder, setSavedOrder] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentBanner, setCurrentBanner] = useState(0);
  const { billingId, paymentId: paymentIdFromAddPayment, tempOrder: tempOrderFromLocation, cardDetailsSaved: cardDetailsSavedFromAddPayment, paymentSubmitted: paymentSubmittedFromAddPayment } = location.state || {};

  useEffect(() => {
    console.log('OrderPage: Location state:', { billingId, paymentIdFromAddPayment, tempOrderFromLocation, cardDetailsSavedFromAddPayment, paymentSubmittedFromAddPayment, tempOrder });

    if (tempOrderFromLocation && tempOrderFromLocation.length > 0) {
      setTempOrder(tempOrderFromLocation);
    }

    if (cardDetailsSavedFromAddPayment && paymentIdFromAddPayment) {
      setCardDetailsSaved(true);
      setPaymentId(paymentIdFromAddPayment);
      setPaymentMethod('card');
      setPaymentMessage('Card details saved successfully');
    }

    if (paymentSubmittedFromAddPayment && paymentIdFromAddPayment) {
      setPaymentSubmitted(true);
      setPaymentId(paymentIdFromAddPayment);
      setPaymentMethod('card');
      setPaymentMessage('Payment successful');
      setSavedOrder(tempOrderFromLocation || tempOrder);
      setTempOrder([]);
      setCardDetailsSaved(false);
    }

    if (billingId && !billingSummary) {
      const fetchBilling = async () => {
        try {
          if (!/^[0-9a-fA-F]{24}$/.test(billingId)) {
            throw new Error('Invalid billing ID format');
          }
          setLoading(true);
          console.log('OrderPage: Fetching billing for ID:', billingId);
          const response = await axios.get(`http://localhost:5000/api/billing/${billingId}`, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' },
          });
          console.log('OrderPage: Billing response:', response.data);
          if (!response.data.billing) {
            throw new Error('No billing data returned');
          }
          setBillingSummary(response.data.billing);
        } catch (error) {
          console.error('OrderPage: Error fetching billing:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack,
          });
          let errorMessage = 'Failed to fetch billing details: ';
          if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
            errorMessage += 'Cannot connect to the server. Please ensure the backend is running on http://localhost:5000.';
          } else if (error.response?.status === 404) {
            errorMessage += 'Billing record not found. Please add or update billing details.';
          } else if (error.response?.status === 400) {
            errorMessage += 'Invalid billing ID format.';
          } else {
            errorMessage += error.response?.data?.message || error.message;
          }
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchBilling();
    } else if (!billingId) {
      console.log('OrderPage: No billingId provided in location.state');
      setError('Billing information missing. Please add billing details.');
    }
  }, [billingId, paymentIdFromAddPayment, tempOrderFromLocation, cardDetailsSavedFromAddPayment, paymentSubmittedFromAddPayment, setTempOrder, tempOrder, billingSummary]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setPaymentSlip(null);
    setError(null);
    setPaymentMessage('');
  };

  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('OrderPage: Selected payment slip:', file.name, file.size, file.type);
      setPaymentSlip(file);
    } else {
      console.log('OrderPage: No file selected');
      setError('Please select a valid payment slip file');
    }
  };

  const handleDeleteItem = (productId) => {
    const updatedOrder = tempOrder.filter((item) => item.productId !== productId);
    setTempOrder(updatedOrder);
  };

  const handleQuantityUpdate = (productId, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setTempOrder(tempOrder.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const green = [46, 125, 50];
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text("AgroSphere", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("agrosphere@gmail.com", 20, 28);
    doc.text("AgroSphere, Colombo Rd, Kurunegala", 20, 34);

    doc.setFont("helvetica", "italic");
    doc.text(`${formattedDate}`, 20, 42);
    doc.line(20, 46, 190, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Order Invoice", 105, 55, { align: "center" });

    // Billing Information (if available)
    if (billingSummary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Billing Information:", 20, 65);
      doc.text(`Name: ${billingSummary.firstName} ${billingSummary.lastName}`, 20, 73);
      doc.text(`Email: ${billingSummary.email}`, 20, 79);
      doc.text(`Phone: ${billingSummary.contactNumber}`, 20, 85);
      doc.text(`Address: ${billingSummary.street}, ${billingSummary.city}, ${billingSummary.country}`, 20, 91);
      doc.line(20, 95, 190, 95);
    }

    // Table
    autoTable(doc, {
      startY: billingSummary ? 100 : 65,
      head: [["Product Name", "Quantity", "Price (Rs)", "Total (Rs)"]],
      body: (paymentSubmitted ? savedOrder : tempOrder).map((item) => [
        item.productname,
        item.quantity,
        item.price.toFixed(2),
        (item.price * item.quantity).toFixed(2),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: green,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          105,
          290,
          { align: "center" }
        );
      },
    });

    // Add Total Amount
    const total = (paymentSubmitted ? savedOrder : tempOrder)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
    const finalY = doc.lastAutoTable.finalY || (billingSummary ? 100 : 65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: Rs ${total}`, 20, finalY + 10);

    doc.save(`AgroSphere_Order_Invoice_${now.toISOString().slice(0, 10)}.pdf`);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPaymentMessage('');

    console.log('OrderPage: Submitting payment with tempOrder:', tempOrder);
    console.log('OrderPage: Billing ID:', billingId);
    console.log('OrderPage: Payment method:', paymentMethod);
    console.log('OrderPage: Payment slip:', paymentSlip);

    if (!billingId) {
      setError('Please enter billing information first');
      return;
    }
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    if (paymentMethod === 'slip' && !paymentSlip) {
      setError('Please upload a payment slip');
      return;
    }
    if (tempOrder.length === 0) {
      setError('No items in order');
      return;
    }

    let orderId = 'order_' + Date.now();
    if (paymentId) {
      try {
        const response = await axios.get(`http://localhost:5000/api/payment/${paymentId}`, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('OrderPage: Payment fetch response:', response.data);
        if (response.data.payment) {
          orderId = response.data.payment.orderId;
          console.log('OrderPage: Fetched orderId from payment:', orderId);
          if (response.data.payment.status === 'completed') {
            console.log('OrderPage: Payment already completed:', paymentId);
            setPaymentId(response.data.payment._id);
            setPaymentSubmitted(true);
            setSavedOrder([...tempOrder]);
            setTempOrder([]);
            setPaymentMessage('Payment successful');
            setCardDetailsSaved(false);
            return;
          }
        }
      } catch (error) {
        console.error('OrderPage: Error fetching payment for orderId:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack,
        });
        setError('Error fetching payment details: ' + (error.response?.data?.message || error.message));
      }
    }

    if (paymentMethod === 'card' && !cardDetailsSaved) {
      navigate('/add-payment', {
        state: { billingId, tempOrder, orderId, paymentId: paymentId || null },
      });
      return;
    }

    if (paymentMethod === 'card' && cardDetailsSaved) {
      const total = tempOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderItems = tempOrder.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productname: item.productname,
        price: item.price,
      }));

      const formData = new FormData();
      formData.append('billingId', billingId);
      formData.append('orderId', orderId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('orderItems', JSON.stringify(orderItems));
      formData.append('totalAmount', total.toFixed(2));
      formData.append('paymentId', paymentId);

      console.log('OrderPage: Finalizing payment with formData:', Object.fromEntries(formData));

      try {
        setLoading(true);
        const response = await axios.post('http://localhost:5000/api/payment/finalize', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 5000,
        });
        console.log('OrderPage: Payment response:', response.data);
        setPaymentId(response.data.payment._id);
        setPaymentSubmitted(true);
        setSavedOrder([...tempOrder]);
        setTempOrder([]);
        setPaymentMessage('Payment successful');
        setCardDetailsSaved(false);
      } catch (error) {
        console.error('OrderPage: Error finalizing payment:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack,
        });
        let errorMessage = 'Error finalizing payment: ';
        if (error.response?.status === 404) {
          errorMessage += 'Payment finalization endpoint not found. Please check the backend route /api/payment/finalize.';
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
          errorMessage += 'Cannot connect to the server. Please ensure the backend is running on http://localhost:5000.';
        } else {
          errorMessage += error.response?.data?.message || error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    const total = tempOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderItems = tempOrder.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      productname: item.productname,
      price: item.price,
    }));

    const formData = new FormData();
    formData.append('billingId', billingId);
    formData.append('orderId', orderId);
    formData.append('paymentMethod', paymentMethod);
    formData.append('orderItems', JSON.stringify(orderItems));
    formData.append('totalAmount', total.toFixed(2));
    if (paymentSlip && paymentMethod === 'slip') {
      formData.append('paymentSlip', paymentSlip);
    }

    console.log('OrderPage: Sending formData:', Object.fromEntries(formData));

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000,
      });
      console.log('OrderPage: Payment response:', response.data);
      setPaymentId(response.data.payment._id);
      setPaymentSubmitted(true);
      setSavedOrder([...tempOrder]);
      setTempOrder([]);
      setPaymentMessage('Order successful, admin will verify the payment');
    } catch (error) {
      console.error('OrderPage: Error processing payment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      setError('Error processing payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCardDetails = () => {
    const orderId = 'order_' + Date.now();
    navigate('/add-payment', {
      state: { billingId, tempOrder: savedOrder.length > 0 ? savedOrder : tempOrder, orderId, paymentId },
    });
  };

  const bannerImages = [
    '/images/cropinput5.webp',
    '/images/crpoinput9.avif'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <>
      <Helmet>
        <title>AgroSphere | Order</title>
      </Helmet>
      <div>
        <Header />
        <div className="order-page">
          <div className="banner">
            <img
              key={currentBanner}
              src={bannerImages[currentBanner]}
              alt="Banner"
              className="banner-img"
            />
            <div className="banner-overlay"></div>
            <h1 className="banner-title">🛒 AgroSphere - Order Summary 📋</h1>
          </div>
          <div className="container">
            {loading && <p className="text-loading">Loading...</p>}
            {error && (
              <div className="text-error">
                <p>{error}</p>
              </div>
            )}
            {paymentMessage && <p className="text-success">{paymentMessage}</p>}
            <div className="button-group">
              {!paymentSubmitted && (
                <>
                  <button
                    className="bg-primary"
                    onClick={() => navigate('/product')}
                  >
                    Back to Catalog
                  </button>
                  <button
                    className="bg-primary"
                    onClick={() => navigate('/billing', { state: { tempOrder, billingId, isNewBilling: !billingId } })}
                  >
                    {billingId ? 'Update Billing Details' : 'Add Billing Details'}
                  </button>
                </>
              )}
              {paymentSubmitted && paymentMethod === 'slip' && (
                <button
                  className="bg-primary"
                  onClick={() => navigate('/')}
                >
                  Back to Catalog
                </button>
              )}
              {paymentSubmitted && paymentMethod === 'card' && (
                <>
                  <button
                    className="bg-primary"
                    onClick={() => navigate('/product')}
                  >
                    Back to Catalog
                  </button>
                  <button
                    className="bg-success"
                    onClick={generatePDF}
                  >
                    Download Invoice as PDF
                  </button>
                </>
              )}
              {cardDetailsSaved && !paymentSubmitted && (
                <button
                  className="bg-primary"
                  onClick={handleUpdateCardDetails}
                >
                  Update Card Details
                </button>
              )}
            </div>
            <div className="order-items-container">
              <div className="order-items-header">
                <h2>🛒 Your Order Items</h2>
              </div>
              {(paymentSubmitted ? savedOrder : tempOrder).length === 0 ? (
                <div className="no-items">No items in your order</div>
              ) : (
                <>
                  {(paymentSubmitted ? savedOrder : tempOrder).map((item, index) => (
                    <div key={item.productId} className="order-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="order-item-content">
                        <div className="order-item-details">
                          <h4 className="order-item-name">{item.productname}</h4>
                          <div className="order-item-quantity">
                            <span>Quantity:</span>
                            {!paymentSubmitted && (
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityUpdate(item.productId, e.target.value)}
                              />
                            )}
                            {paymentSubmitted && <span>{item.quantity}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="order-item-actions">
                        <div className="order-item-price">Rs {(item.price * item.quantity).toFixed(2)}</div>
                        {!paymentSubmitted && (
                          <button
                            className="bg-danger"
                            onClick={() => handleDeleteItem(item.productId)}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="order-total">
                    <h3>💰 Total Amount</h3>
                    <div className="order-total-amount">
                      Rs {(paymentSubmitted ? savedOrder : tempOrder)
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>
            {billingId && billingSummary && (
              <div className="billing-summary">
                <h3>📋 Billing Information</h3>
                <div className="billing-details">
                  <div className="billing-detail">
                    <div className="billing-detail-label">Full Name</div>
                    <div className="billing-detail-value">{billingSummary.firstName} {billingSummary.lastName}</div>
                  </div>
                  <div className="billing-detail">
                    <div className="billing-detail-label">Email Address</div>
                    <div className="billing-detail-value">{billingSummary.email}</div>
                  </div>
                  <div className="billing-detail">
                    <div className="billing-detail-label">Phone Number</div>
                    <div className="billing-detail-value">{billingSummary.contactNumber}</div>
                  </div>
                  <div className="billing-detail">
                    <div className="billing-detail-label">Address</div>
                    <div className="billing-detail-value">{billingSummary.street}, {billingSummary.city}, {billingSummary.country}</div>
                  </div>
                </div>
              </div>
            )}
            {(paymentSubmitted ? savedOrder : tempOrder).length > 0 && !paymentSubmitted && (
              <div className="payment-section">
                <form encType="multipart/form-data">
                  <h3>💳 Payment Method</h3>
                  <div className="form-group">
                    <label>Select Payment Method:</label>
                    <select
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                      required
                    >
                      <option value="">Choose Payment Method</option>
                      <option value="slip">📄 Bank Slip</option>
                      <option value="card">💳 Credit Card</option>
                    </select>
                  </div>
                  {paymentMethod === 'slip' && (
                    <div className="form-group">
                      <label htmlFor="paymentSlip">📤 Upload Payment Slip:</label>
                      <input
                        type="file"
                        id="paymentSlip"
                        name="paymentSlip"
                        onChange={handleSlipChange}
                        accept="image/png,image/jpeg,image/jpg"
                        required
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handlePaymentSubmit}
                  >
                    {loading ? '⏳ Processing...': paymentMethod === 'slip' ? '📄 Submit Payment' : paymentMethod === 'card' && cardDetailsSaved ? '💳 Submit Payment' : '💳 Proceed to Card Payment'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default OrderPage;