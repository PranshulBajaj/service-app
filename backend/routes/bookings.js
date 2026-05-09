const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { protect, vendorOnly, customerOnly } = require('../middleware/auth');

// POST /api/bookings  — customer: book a service
router.post('/', protect, customerOnly, async (req, res) => {
  try {
    const { serviceId, scheduledDate, address, notes } = req.body;
    if (!serviceId || !scheduledDate || !address)
      return res.status(400).json({ message: 'Service, date, and address required' });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ message: 'Service not found' });

    const booking = await Booking.create({
      customer: req.user._id,
      service: serviceId,
      vendor: service.vendor,
      scheduledDate,
      address,
      notes,
      totalAmount: service.price,
    });

    await booking.populate(['service', { path: 'vendor', select: 'name email phone' }]);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/my  — customer: get own bookings
router.get('/my', protect, customerOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('service')
      .populate('vendor', 'name email phone')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/vendor  — vendor: get bookings for their services
router.get('/vendor', protect, vendorOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ vendor: req.user._id })
      .populate('service')
      .populate('customer', 'name email phone')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/bookings/:id/status  — vendor: update booking status
router.patch('/:id/status', protect, vendorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['approved', 'in-progress', 'delivered', 'cancelled'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    await booking.populate(['service', { path: 'customer', select: 'name email phone' }]);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/bookings/:id/cancel  — customer: cancel own booking
router.patch('/:id/cancel', protect, customerOnly, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['pending', 'approved'].includes(booking.status))
      return res.status(400).json({ message: 'Cannot cancel this booking' });

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
