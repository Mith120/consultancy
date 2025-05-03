const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Helper function to check if user has booking on a date
const hasBookingOnDate = async (userId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const booking = await Booking.findOne({
    user: userId,
    date: { $gte: start, $lte: end }
  });
  return booking;
};

// @route   POST api/booking
// @desc    Create a new booking
// @access  Private (customer)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle, date, services, problemDescription, totalAmount } = req.body;

    // Check if user already booked on this date
    const existingBooking = await hasBookingOnDate(userId, date);
    if (existingBooking) {
      // Suggest existing bookings for same or new vehicle
      const suggestions = await Booking.find({
        user: userId,
        date: { $ne: new Date(date) }
      }).sort({ date: 1 });

      return res.status(400).json({
        msg: 'You already have a booking on this date',
        existingBooking,
        suggestions
      });
    }

    const booking = new Booking({
      user: userId,
      vehicle,
      date,
      services,
      problemDescription,
      totalAmount,
      status: 'pending'
    });

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/booking
// @desc    Get bookings for user (customer) or all bookings (admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin: get all bookings sorted by date
      const bookings = await Booking.find().populate('user', 'name email contact').sort({ date: 1 });
      res.json(bookings);
    } else {
      // Customer: get own bookings
      const bookings = await Booking.find({ user: req.user.id }).sort({ date: 1 });
      res.json(bookings);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/booking/:id/confirm
// @desc    Admin confirm booking
// @access  Private (admin)
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    booking.status = 'confirmed';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/booking/:id/complete
// @desc    Admin mark booking as completed
// @access  Private (admin)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    booking.status = 'completed';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/booking/:id/message
// @desc    Send message for a booking
// @access  Private
router.post('/:id/message', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if user is part of booking (admin or booking user)
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { messageType, content } = req.body;
    booking.messages.push({
      sender: req.user.id,
      messageType,
      content
    });

    await booking.save();
    res.json(booking.messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
