import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CustomerDashboard.css';

const servicesList = [
  { name: 'Oil Change', price: 50 },
  { name: 'Tire Rotation', price: 30 },
  { name: 'Brake Inspection', price: 40 },
  { name: 'Battery Check', price: 25 },
  { name: 'Engine Diagnostic', price: 100 }
];

const CustomerDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [date, setDate] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [problemText, setProblemText] = useState('');
  const [problemFiles, setProblemFiles] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    // Fetch user vehicles from backend
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { 'x-auth-token': token }
        });
        setVehicles(res.data.vehicles || []);
        if (res.data.vehicles && res.data.vehicles.length > 0) {
          setSelectedVehicle(res.data.vehicles[0].vehicleNumber);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Calculate total amount
    const total = selectedServices.reduce((acc, serviceName) => {
      const service = servicesList.find(s => s.name === serviceName);
      return acc + (service ? service.price : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedServices]);

  const onServiceChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedServices([...selectedServices, value]);
    } else {
      setSelectedServices(selectedServices.filter(s => s !== value));
    }
  };

  const onFileChange = e => {
    setProblemFiles([...e.target.files]);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!selectedVehicle || !date || selectedServices.length === 0) {
      setMessage('Please select vehicle, date and at least one service.');
      return;
    }

    // Prepare problemDescription array with text and files as base64
    const problemDescription = [];

    if (problemText.trim()) {
      problemDescription.push({ type: 'text', content: problemText.trim() });
    }

    for (const file of problemFiles) {
      const base64 = await toBase64(file);
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'text';
      problemDescription.push({ type, content: base64 });
    }

    // Find selected vehicle details
    const vehicleDetails = vehicles.find(v => v.vehicleNumber === selectedVehicle);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/booking', {
        vehicle: vehicleDetails,
        date,
        services: selectedServices,
        problemDescription,
        totalAmount
      }, {
        headers: { 'x-auth-token': token }
      });
      setMessage('Booking created successfully!');
      setBookingConfirmed(true);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Booking failed');
    }
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return (
    <div className="container customer-dashboard">
      <h2>Book a Service Slot</h2>
      {message && <p className="message">{message}</p>}
      {!bookingConfirmed ? (
        <form onSubmit={onSubmit} className="booking-form">
          <label>Vehicle:</label>
          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            {vehicles.map(v => (
              <option key={v.vehicleNumber} value={v.vehicleNumber}>
                {v.vehicleNumber} - {v.vehicleModel} ({v.vehicleType})
              </option>
            ))}
          </select>

          <label>Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />

          <label>Services:</label>
          <div className="services-list">
            {servicesList.map(service => (
              <div key={service.name} className="service-item">
                <input
                  type="checkbox"
                  id={service.name}
                  value={service.name}
                  onChange={onServiceChange}
                />
                <label htmlFor={service.name}>
                  {service.name} (${service.price})
                </label>
              </div>
            ))}
          </div>

          <label>Problem Description (text):</label>
          <textarea
            value={problemText}
            onChange={e => setProblemText(e.target.value)}
            placeholder="Describe the problem with your car"
          />

          <label>Problem Description (images/videos):</label>
          <input type="file" multiple accept="image/*,video/*" onChange={onFileChange} />

          <p>Total Amount: ${totalAmount}</p>

          <button type="submit">Confirm Booking</button>
        </form>
      ) : (
        <p>Your booking has been confirmed. Thank you!</p>
      )}
    </div>
  );
};

export default CustomerDashboard;
