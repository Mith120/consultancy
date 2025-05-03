import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleType: ''
  });
  const [error, setError] = useState('');

  const { name, email, contact, password, vehicleNumber, vehicleModel, vehicleType } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!name || !email || !contact || !password || !vehicleNumber || !vehicleModel || !vehicleType) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        contact,
        password,
        vehicles: [
          {
            vehicleNumber,
            vehicleModel,
            vehicleType
          }
        ]
      });
      localStorage.setItem('token', res.data.token);
      // Decode token to get role (default customer)
      localStorage.setItem('role', 'customer');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={onSubmit} className="register-form">
        <input type="text" name="name" placeholder="Name" value={name} onChange={onChange} />
        <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} />
        <input type="text" name="contact" placeholder="Contact" value={contact} onChange={onChange} />
        <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} />
        <input type="text" name="vehicleNumber" placeholder="Vehicle Number" value={vehicleNumber} onChange={onChange} />
        <input type="text" name="vehicleModel" placeholder="Vehicle Model" value={vehicleModel} onChange={onChange} />
        <input type="text" name="vehicleType" placeholder="Vehicle Type" value={vehicleType} onChange={onChange} />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
