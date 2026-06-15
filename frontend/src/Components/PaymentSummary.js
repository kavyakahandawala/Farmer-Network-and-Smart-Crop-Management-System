import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Payment from './Payment/Payment';

const URL = 'http://localhost:5000/payments';

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function PaymentSummary() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    fetchHandler().then((data) => setPayments(data.payments || []));
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div>
      {payments && payments.map((payment, i) => (
        <div key={payment._id || i}>
          <Payment payment={payment} />
        </div>
      ))}
    </div>
  );
}

export default PaymentSummary;