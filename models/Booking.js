const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: { type: String, enum: ['text', 'image', 'video'], required: true },
  content: { type: String, required: true }, // text or URL or base64 string
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: {
    vehicleNumber: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleType: { type: String, required: true }
  },
  date: { type: Date, required: true },
  services: [{ type: String, required: true }],
  problemDescription: [
    {
      type: { type: String, enum: ['text', 'image', 'video'], required: true },
      content: { type: String, required: true }
    }
  ],
  status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
  messages: [MessageSchema],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
