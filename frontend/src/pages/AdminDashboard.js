import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/booking', {
        headers: { 'x-auth-token': token }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmBooking = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/booking/${id}/confirm`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage('Booking confirmed');
      fetchBookings();
    } catch (err) {
      console.error(err);
      setMessage('Failed to confirm booking');
    }
  };

  const completeBooking = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/booking/${id}/complete`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage('Booking marked as completed');
      fetchBookings();
    } catch (err) {
      console.error(err);
      setMessage('Failed to mark booking as completed');
    }
  };

  return (
    <div className="container admin-dashboard">
      <h2>Admin Dashboard - All Bookings</h2>
      {message && <p className="message">{message}</p>}
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Services</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="7">No bookings found</td>
            </tr>
          ) : (
            bookings.map(booking => (
              <tr key={booking._id}>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.user?.name} ({booking.user?.email})</td>
                <td>{booking.vehicle.vehicleNumber} - {booking.vehicle.vehicleModel}</td>
                <td>{booking.services.join(', ')}</td>
                <td>{booking.status}</td>
                <td>${booking.totalAmount}</td>
                <td>
                  {booking.status === 'pending' && (
                    <button onClick={() => confirmBooking(booking._id)}>Confirm</button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button onClick={() => completeBooking(booking._id)}>Mark Completed</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
