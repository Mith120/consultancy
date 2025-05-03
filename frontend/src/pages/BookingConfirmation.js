import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingConfirmation.css';

const BookingConfirmation = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container booking-confirmation">
      <h2>Booking Confirmed</h2>
      <p>Your booking has been successfully confirmed. Thank you for choosing our car care service!</p>
      <button onClick={handleBack}>Back to Dashboard</button>
    </div>
  );
};

export default BookingConfirmation;
