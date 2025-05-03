const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  vehicles: [
    {
      vehicleNumber: { type: String, required: true },
      vehicleModel: { type: String, required: true },
      vehicleType: { type: String, required: true }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
