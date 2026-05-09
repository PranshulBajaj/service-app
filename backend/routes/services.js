const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, vendorOnly } = require('../middleware/auth');

// GET /api/services  — public, list all active services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;

    const services = await Service.find(filter).populate('vendor', 'name email phone');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/services/my  — vendor: get own services
router.get('/my', protect, vendorOnly, async (req, res) => {
  try {
    const services = await Service.find({ vendor: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/services  — vendor: create service
router.post('/', protect, vendorOnly, async (req, res) => {
  try {
    const { title, description, category, price, duration } = req.body;
    if (!title || !description || !category || !price || !duration)
      return res.status(400).json({ message: 'All fields required' });

    const service = await Service.create({ vendor: req.user._id, title, description, category, price, duration });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/services/:id  — vendor: update own service
router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/services/:id  — vendor: delete own service
router.delete('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
