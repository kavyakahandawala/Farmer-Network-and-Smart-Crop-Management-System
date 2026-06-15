import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';
import './AddPayment.css';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {Helmet} from "react-helmet";

const AddPayment = () => {
  const [cardDetails, setCardDetails] = useState({
    cardHolder: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });
  const [error, setError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const location = useLocation();
  const { billingId, orderId, tempOrder, paymentId: incomingPaymentId } = location.state || {};

  useEffect(() => {
    const fetchPayment = async () => {
      console.log('AddPayment: Incoming state:', { billingId, orderId, incomingPaymentId, tempOrder });

      if (!billingId || !orderId) {
        console.error('AddPayment: Missing billingId or orderId:', { billingId, orderId });
        setError('Billing or order information missing');
        setHasFetched(true);
        return;
      }

      if (!incomingPaymentId || hasFetched) {
        console.log('AddPayment: No paymentId or already fetched; assuming new card entry');
        setCardDetails({
          cardHolder: '',
          cardNumber: '',
          expMonth: '',
          expYear: '',
          cvv: '',
        });
        setHasFetched(true);
        return;
      }

      try {
        console.log('AddPayment: Fetching payment for paymentId:', incomingPaymentId, 'billingId:', billingId, 'orderId:', orderId);
        const response = await axios.get(`http://localhost:5000/api/payment/${incomingPaymentId}`, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('AddPayment: Payment fetch response:', response.data);
        const payment = response.data.payment;
        if (payment && payment.paymentMethod === 'card') {
          console.log('AddPayment: Payment validation checks:', {
            orderIdMatch: payment.orderId === orderId,
            billingIdMatch: payment.billingId._id === billingId,
          });
          setCardDetails({
            cardHolder: payment.cardDetails?.cardHolder || '',
            cardNumber: payment.cardDetails?.cardNumber || '',
            expMonth: String(payment.cardDetails?.expMonth || ''),
            expYear: String(payment.cardDetails?.expYear || ''),
            cvv: String(payment.cardDetails?.cvv || ''),
          });
          setPaymentId(payment._id);
          console.log('AddPayment: Found existing payment:', payment);
        } else {
          console.log('AddPayment: No valid payment found for paymentId:', incomingPaymentId);
          setError('No valid payment found. Please add new card details.');
          setCardDetails({
            cardHolder: '',
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvv: '',
          });
          setPaymentId(null);
        }
      } catch (error) {
        console.error('AddPayment: Error fetching payment:', error.message, error.response?.data, error.stack);
        let errorMessage = 'Failed to fetch existing payment details: ';
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
          errorMessage += 'Cannot connect to the server. Please ensure the backend is running on http://localhost:5000.';
        } else if (error.response?.status === 404) {
          errorMessage += 'Payment record not found. Please add new card details.';
        } else if (error.response?.status === 400) {
          errorMessage += 'Invalid payment ID format.';
        } else {
          errorMessage += error.response?.data?.message || error.message;
        }
        setError(errorMessage);
        setCardDetails({
          cardHolder: '',
          cardNumber: '',
          expMonth: '',
          expYear: '',
          cvv: '',
        });
        setPaymentId(null);
      } finally {
        setHasFetched(true);
      }
    };

    if (billingId && orderId && !hasFetched) {
      fetchPayment();
    } else if (!billingId || !orderId) {
      setError('Billing or order information missing');
      setHasFetched(true);
    }
  }, [billingId, orderId, incomingPaymentId, hasFetched, tempOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber' && value.length > 16) return;
    if (name === 'cvv' && value.length > 3) return;
    if (name === 'expMonth' && value && (parseInt(value) < 1 || parseInt(value) > 12)) return;
    if (name === 'expYear' && value && (parseInt(value) < 2025 || parseInt(value) > 2035)) return;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPaymentMessage('');
    setLoading(true); // Set loading to true when submission starts

    console.log('AddPayment: Submitting card details with:', {
      billingId,
      orderId,
      tempOrder,
      cardDetails,
      paymentId,
      cvvType: typeof cardDetails.cvv,
      cvvValue: cardDetails.cvv,
    });

    if (!billingId || !orderId) {
      setError('Billing or order information missing');
      setLoading(false); // Reset loading on error
      return;
    }
    if (!tempOrder || tempOrder.length === 0) {
      setError('Order items are missing');
      setLoading(false); // Reset loading on error
      return;
    }
    if (!cardDetails.cardHolder) {
      setError('Cardholder name is required');
      setLoading(false); // Reset loading on error
      return;
    }
    if (cardDetails.cardNumber.length !== 16) {
      setError('Card number must be exactly 16 digits');
      setLoading(false); // Reset loading on error
      return;
    }
    const cvvString = String(cardDetails.cvv).trim();
    if (cvvString.length !== 3) {
      setError('CVV must be exactly 3 digits');
      setLoading(false); // Reset loading on error
      return;
    }
    if (!cardDetails.expMonth || !cardDetails.expYear) {
      setError('Please enter both expiry month and year');
      setLoading(false); // Reset loading on error
      return;
    }

    const formData = new FormData();
    formData.append('billingId', billingId);
    formData.append('orderId', orderId);
    formData.append('paymentMethod', 'card');
    formData.append('cardHolder', cardDetails.cardHolder);
    formData.append('cardNumber', cardDetails.cardNumber);
    formData.append('expMonth', cardDetails.expMonth);
    formData.append('expYear', cardDetails.expYear);
    formData.append('cvv', cvvString);
    formData.append('orderItems', JSON.stringify(tempOrder));
    formData.append('totalAmount', tempOrder.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

    console.log('AddPayment: Sending formData:', Object.fromEntries(formData));

    try {
      let response;
      if (paymentId) {
        response = await axios.put(`http://localhost:5000/api/payment/${paymentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 5000,
        });
      } else {
        response = await axios.post('http://localhost:5000/api/payment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 5000,
        });
      }
      console.log('AddPayment: Payment response:', response.data);
      setPaymentMessage('Card details saved successfully');
      setPaymentId(response.data.payment._id);
      navigate('/order', {
        state: { billingId, tempOrder, cardDetailsSaved: true, paymentId: response.data.payment._id },
      });
    } catch (error) {
      console.error('AddPayment: Error saving card details:', error.response?.data || error.message, error.stack);
      setError('Error saving card details: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false); // Reset loading after request completes
    }
  };

  return (
    <>
        <Helmet>
          <title>AgroSphere | Add Card </title>
        </Helmet>
    <div>
      <Header />
      <div className="add-payment">
        {/* ===== Banner with Icons ===== */}
        <div className="banner">
          <div className="banner-content">
            <h1>💳 AgroSphere - Add Card Details 💳</h1>
            <div className="banner-icons">
              <FaUser size={32} />
              <FaCreditCard size={32} />
              <FaCalendarAlt size={32} />
              <FaLock size={32} />
            </div>
          </div>
        </div>

        <div className="container">
          {error && (
            <div className="text-error">
              <p>{error}</p>
            </div>
          )}
          {paymentMessage && (
            <div className="text-success">
              <p>{paymentMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <h3>💳 Card Details</h3>
            {/* Cardholder Name */}
            <div className="input-group">
              <label htmlFor="cardHolder">Cardholder Name</label>
              <FaUser className="icon" />
              <input
                type="text"
                id="cardHolder"
                name="cardHolder"
                value={cardDetails.cardHolder}
                onChange={handleChange}
                required
              />
            </div>

            {/* Card Number */}
            <div className="input-group">
              <label htmlFor="cardNumber">Card Number</label>
              <FaCreditCard className="icon" />
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleChange}
                maxLength="16"
                required
              />
            </div>

            {/* Expiry Month & Year */}
            <div className="flex">
              <div className="input-group">
                <label htmlFor="expMonth">Expiry Month (1-12)</label>
                <FaCalendarAlt className="icon" />
                <input
                  type="number"
                  id="expMonth"
                  name="expMonth"
                  value={cardDetails.expMonth}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="expYear">Expiry Year (2025-2035)</label>
                <FaCalendarAlt className="icon" />
                <input
                  type="number"
                  id="expYear"
                  name="expYear"
                  value={cardDetails.expYear}
                  onChange={handleChange}
                  min="2025"
                  max="2035"
                  required
                />
              </div>
            </div>

            {/* CVV */}
            <div className="input-group">
              <label htmlFor="cvv">CVV</label>
              <FaLock className="icon" />
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleChange}
                maxLength="3"
                required
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                className="back-button"
                onClick={() => navigate('/order', { state: { billingId, tempOrder } })}
              >
                Back to Order
              </button>
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Saving...' : '💳 Save Card Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default AddPayment;